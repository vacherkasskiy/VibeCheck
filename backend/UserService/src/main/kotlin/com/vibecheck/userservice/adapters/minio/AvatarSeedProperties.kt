package com.vibecheck.userservice.adapters.minio

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "user-service.avatar-seed")
data class AvatarSeedProperties(
    val enabled: Boolean = false,
    val objectPrefix: String = "avatars",
)