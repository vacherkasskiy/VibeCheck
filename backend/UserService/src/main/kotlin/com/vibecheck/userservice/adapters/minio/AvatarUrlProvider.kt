package com.vibecheck.userservice.adapters.minio

import com.vibecheck.userservice.configuration.MinioProperties
import io.minio.GetPresignedObjectUrlArgs
import io.minio.MinioClient
import io.minio.http.Method
import org.springframework.stereotype.Service
import java.net.URI

@Service
class AvatarUrlProvider(
    private val minioProperties: MinioProperties,
) {
    private val publicMinioClient: MinioClient by lazy {
        buildClient(minioProperties.requiredPublicEndpoint())
    }

    fun getReadUrl(objectKey: String): String {
        return publicMinioClient.getPresignedObjectUrl(
            GetPresignedObjectUrlArgs.builder()
                .method(Method.GET)
                .bucket(minioProperties.bucket)
                .`object`(objectKey)
                .expiry(DEFAULT_PRESIGN_EXPIRY_SECONDS)
                .build()
        )
    }

    private fun buildClient(endpoint: String): MinioClient = MinioClient.builder()
        .endpoint(normalizeEndpoint(endpoint).toString())
        .credentials(
            minioProperties.requiredAccessKey(),
            minioProperties.requiredSecretKey(),
        )
        .build()

    private fun normalizeEndpoint(endpoint: String): URI {
        val rawEndpoint = endpoint.trim()
        val normalized = if (rawEndpoint.startsWith("http://") || rawEndpoint.startsWith("https://")) {
            rawEndpoint
        } else {
            val scheme = if (minioProperties.useSsl) "https" else "http"
            "$scheme://$rawEndpoint"
        }

        return URI.create(normalized)
    }

    private companion object {
        private const val DEFAULT_PRESIGN_EXPIRY_SECONDS = 60 * 60 * 24
    }
}
