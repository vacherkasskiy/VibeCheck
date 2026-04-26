package com.vibecheck.gatewayservice.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "gateway")
data class GatewayProperties(
    val services: Services = Services(),
    val internalTokenAudiences: InternalTokenAudiences = InternalTokenAudiences()
) {
    data class Services(
        val userServiceUrl: String = "http://localhost:8081",
        val subscriptionServiceUrl: String = "http://localhost:8082",
        val reviewServiceUrl: String = "http://localhost:5222",
        val gamificationServiceUrl: String = "http://localhost:5223"
    )

    data class InternalTokenAudiences(
        val subscriptionService: String = "subscription-service",
        val reviewService: String = "review-service",
        val gamificationService: String = "gamification-service"
    )
}
