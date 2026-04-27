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
            upsertAvatar(fileName, objectKey)
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

    fun upsertAvatar(id: String, objectKey: String) {
        val existingAvatar = avatarStorage.findById(id)
        if (existingAvatar != null) {
            return
        }

        val avatar = Avatar.new(id, objectKey)
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
