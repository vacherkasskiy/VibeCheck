package com.vibecheck.gatewayservice.config

import org.springframework.cloud.gateway.route.RouteLocator
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class GatewayRoutesConfig(
    private val gatewayProperties: GatewayProperties
) {

    @Bean
    fun customRouteLocator(builder: RouteLocatorBuilder): RouteLocator {
        return builder.routes()
            .route("user-service") { route ->
                route.path(
                    "/api/v1/auth/**",
                    "/api/v1/registration/**",
                    "/api/v1/users/**",
                    "/api/v1/onboarding/**",
                    "/api/v1/reports/**",
                    "/api/v1/avatars/**"
                ).uri(gatewayProperties.services.userServiceUrl)
            }
            .route("subscription-service") { route ->
                route.path(
                    "/api/v1/subscriptions/**",
                    "/api/v1/activity/**"
                ).uri(gatewayProperties.services.subscriptionServiceUrl)
            }
            .build()
    }
}