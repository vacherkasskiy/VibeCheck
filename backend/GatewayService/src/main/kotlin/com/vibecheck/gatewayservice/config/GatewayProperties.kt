package com.vibecheck.gatewayservice.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "gateway")
data class GatewayProperties(
    val services: Services,
    val internalTokenAudiences: InternalTokenAudiences
) {
    data class Services(
        val userServiceUrl: String,
        val subscriptionServiceUrl: String,
        val reviewServiceUrl: String,
        val gamificationServiceUrl: String
    )

    data class InternalTokenAudiences(
        val subscriptionService: String,
        val reviewService: String,
        val gamificationService: String
    )
}
