package com.vibecheck.userservice.configuration

import io.minio.MinioClient
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@ConditionalOnProperty(
    prefix = "user-service.avatar-seed",
    name = ["enabled"],
    havingValue = "true",
)
class MinioConfig {
    @Bean
    fun minioClient(minioProperties: MinioProperties): MinioClient = MinioClient.builder()
        .endpoint(minioProperties.requiredEndpoint())
        .credentials(
            minioProperties.requiredAccessKey(),
            minioProperties.requiredSecretKey(),
        )
        .build()
}
