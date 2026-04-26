package com.vibecheck.userservice.configuration

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app.minio")
data class MinioProperties(
    val endpoint: String? = null,
    val publicEndpoint: String? = null,
    val accessKey: String? = null,
    val secretKey: String? = null,
    val bucket: String = "user-service",
    val useSsl: Boolean = false,
) {
    fun requiredEndpoint(): String =
        endpoint?.takeIf { it.isNotBlank() }
            ?: error("Property 'app.minio.endpoint' must be configured when avatar seeding is enabled")

    fun requiredPublicEndpoint(): String =
        publicEndpoint?.takeIf { it.isNotBlank() }
            ?: error("Property 'app.minio.public-endpoint' must be configured when avatar seeding is enabled")

    fun requiredAccessKey(): String =
        accessKey?.takeIf { it.isNotBlank() }
            ?: error("Property 'app.minio.access-key' must be configured when avatar seeding is enabled")

    fun requiredSecretKey(): String =
        secretKey?.takeIf { it.isNotBlank() }
            ?: error("Property 'app.minio.secret-key' must be configured when avatar seeding is enabled")
}
