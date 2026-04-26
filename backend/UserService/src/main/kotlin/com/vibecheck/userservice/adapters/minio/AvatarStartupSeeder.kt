package com.vibecheck.userservice.adapters.minio

import com.vibecheck.userservice.configuration.MinioProperties
import com.vibecheck.userservice.domain.Avatar
import com.vibecheck.userservice.usecase.storage.AvatarStorage
import io.minio.*
import io.minio.errors.ErrorResponseException
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.core.annotation.Order
import org.springframework.core.io.Resource
import org.springframework.core.io.support.ResourcePatternResolver
import org.springframework.stereotype.Component
import org.springframework.transaction.support.TransactionTemplate
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@Component
@ConditionalOnProperty(
    prefix = "user-service.avatar-seed",
    name = ["enabled"],
    havingValue = "true",
)
@Order(10)
class AvatarStartupSeeder(
    private val minioClient: MinioClient,
    private val minioProperties: MinioProperties,
    private val avatarSeedProperties: AvatarSeedProperties,
    private val avatarStorage: AvatarStorage,
    private val resourcePatternResolver: ResourcePatternResolver,
    private val transactionTemplate: TransactionTemplate,
) : ApplicationRunner {

    override fun run(args: ApplicationArguments) {
        ensureBucketExists()

        val resources = resourcePatternResolver
            .getResources("classpath:/avatars/*")
            .sortedBy { it.filename.orEmpty() }

        for (resource in resources) {
            val fileName = resource.filename ?: continue
            val objectKey = buildObjectKey(fileName)

            uploadAvatarIfMissing(resource, objectKey)
            upsertAvatar(fileName, buildPublicUrl(objectKey))
        }

        logger.info("Seeded {} avatar records for bucket '{}'", resources.size, minioProperties.bucket)
    }

    private fun ensureBucketExists() {
        val bucket = minioProperties.bucket
        val bucketExists = minioClient.bucketExists(
            BucketExistsArgs.builder()
                .bucket(bucket)
                .build(),
        )
        if (!bucketExists) {
            minioClient.makeBucket(
                MakeBucketArgs.builder()
                    .bucket(bucket)
                    .build(),
            )
        }
    }

    private fun uploadAvatarIfMissing(resource: Resource, objectKey: String) {
        if (objectExists(objectKey)) {
            return
        }

        val contentLength = resource.contentLength()
        val contentType = detectContentType(resource)

        resource.inputStream.use { inputStream ->
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(minioProperties.bucket)
                    .`object`(objectKey)
                    .stream(inputStream, contentLength, -1)
                    .contentType(contentType)
                    .build(),
            )
        }
    }

    private fun objectExists(objectKey: String): Boolean = try {
        minioClient.statObject(
            StatObjectArgs.builder()
                .bucket(minioProperties.bucket)
                .`object`(objectKey)
                .build(),
        )
        true
    } catch (exception: ErrorResponseException) {
        val code = exception.errorResponse().code()
        if (code == "NoSuchKey" || code == "NoSuchObject") {
            false
        } else {
            throw exception
        }
    }

    fun upsertAvatar(id: String, url: String) {
        val avatar = avatarStorage.findById(id) ?: Avatar(id = id, version = 1, url = url)
        transactionTemplate.execute {
            avatarStorage.create(avatar)
        }
    }

    private fun buildObjectKey(fileName: String): String {
        val normalizedPrefix = avatarSeedProperties.objectPrefix.trim('/').takeIf { it.isNotBlank() }
        return if (normalizedPrefix == null) {
            fileName
        } else {
            "$normalizedPrefix/$fileName"
        }
    }

    private fun buildPublicUrl(objectKey: String): String {
        val publicEndpoint = minioProperties.requiredPublicEndpoint().trim().removeSuffix("/")
        val schemePrefix = if (publicEndpoint.startsWith("http://") || publicEndpoint.startsWith("https://")) {
            publicEndpoint
        } else {
            val scheme = if (minioProperties.useSsl) "https" else "http"
            "$scheme://$publicEndpoint"
        }

        return "$schemePrefix/${minioProperties.bucket}/${encodePath(objectKey)}"
    }

    private fun encodePath(path: String): String =
        path.split("/")
            .joinToString("/") { segment ->
                URLEncoder.encode(segment, StandardCharsets.UTF_8).replace("+", "%20")
            }

    private fun detectContentType(resource: Resource): String {
        val fileName = resource.filename.orEmpty().lowercase()
        return when {
            fileName.endsWith(".png") -> "image/png"
            fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") -> "image/jpeg"
            fileName.endsWith(".svg") -> "image/svg+xml"
            else -> "application/octet-stream"
        }
    }

    private companion object {
        private val logger = LoggerFactory.getLogger(AvatarStartupSeeder::class.java)
    }
}
