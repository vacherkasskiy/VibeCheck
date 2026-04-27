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
        val publicUri = normalizeEndpoint(
            minioProperties.publicEndpoint?.takeIf { it.isNotBlank() } ?: minioProperties.requiredEndpoint()
        )

        MinioClient.builder()
            .endpoint(publicUri.toString())
            .credentials(
                minioProperties.requiredAccessKey(),
                minioProperties.requiredSecretKey(),
            )
            .build()
    }

    fun getReadUrl(objectKey: String): String =
        publicMinioClient.getPresignedObjectUrl(
            GetPresignedObjectUrlArgs.builder()
                .method(Method.GET)
                .bucket(minioProperties.bucket)
                .`object`(objectKey)
                .expiry(DEFAULT_PRESIGN_EXPIRY_SECONDS)
                .build()
        )

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
