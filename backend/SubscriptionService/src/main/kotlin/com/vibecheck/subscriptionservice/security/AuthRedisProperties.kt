package com.vibecheck.subscriptionservice.security

import org.springframework.boot.context.properties.ConfigurationProperties
import java.time.Duration

@ConfigurationProperties(prefix = "app.redis")
data class AuthRedisProperties(
    val userCacheTtl: Duration,
    val revokeMarkerTtlPadding: Duration
)