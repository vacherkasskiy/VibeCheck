package com.vibecheck.userservice.security

import org.springframework.boot.context.properties.ConfigurationProperties
import java.time.Duration

@ConfigurationProperties(prefix = "app.jwt")
data class JwtProperties(
    val issuer: String,
    val externalAudience: String,
    val internalAudience: String,
    val accessTtl: Duration,
    val internalTtl: Duration,
    val refreshTtl: Duration,
    val keyId: String,
    val privateKeyPath: String,
    val publicKeyPath: String
)