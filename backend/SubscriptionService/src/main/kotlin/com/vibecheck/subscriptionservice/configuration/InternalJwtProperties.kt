package com.vibecheck.subscriptionservice.configuration

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app.internal-jwt")
data class InternalJwtProperties(
    val issuer: String,
    val audience: String,
    val kid: String,
    val publicKeyPath: String,
)
