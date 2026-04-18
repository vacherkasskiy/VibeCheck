package com.vibecheck.userservice.security.jwt

import org.springframework.boot.context.properties.ConfigurationProperties
import java.time.Duration

@ConfigurationProperties(prefix = "app.internal-jwt")
data class InternalJwtProperties(
    val issuer: String,
    val ttl: Duration,
    val kid: String,
    val privateKeyPath: String,
)
