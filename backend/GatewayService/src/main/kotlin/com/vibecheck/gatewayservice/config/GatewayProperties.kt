package com.vibecheck.gatewayservice.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "gateway")
data class GatewayProperties(
    val services: Services = Services(),
    val publicPaths: List<String> = listOf(
        "/actuator/health",
        "/api/v1/auth/**",
        "/api/v1/registration/**"
    )
) {
    data class Services(
        val userServiceUrl: String = "http://localhost:8081",
        val subscriptionServiceUrl: String = "http://localhost:8082"
    )
}