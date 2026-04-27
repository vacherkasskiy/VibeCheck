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
            .route("user-service-public") { route ->
                route.path(
                    "/auth/email/register",
                    "/auth/email/login",
                    "/auth/email/register/confirm",
                    "/auth/refresh",
                    "/auth/email/password/reset",
                    "/avatars/**"
                )
                    .metadata(AUTH_MODE_METADATA_KEY, ProxyAuthMode.NONE.name)
                    .uri(gatewayProperties.services.userServiceUrl)
            }
            .route("user-service-password-confirm-alias") { route ->
                route.path("/auth/email/password/confirm")
                    .filters { filters ->
                        filters.rewritePath(
                            "/auth/email/password/confirm",
                            "/auth/email/password/reset"
                        )
                    }
                    .metadata(AUTH_MODE_METADATA_KEY, ProxyAuthMode.NONE.name)
                    .uri(gatewayProperties.services.userServiceUrl)
            }
            .route("user-service-authorized") { route ->
                route.path(
                    "/auth/internal",
                    "/auth/internal/login",
                    "/auth/logout",
                    "/onboarding/**",
                    "/users/me/info",
                    "/users/*/info",
                    "/users/info",
                    "/users/*/reports"
                )
                    .metadata(AUTH_MODE_METADATA_KEY, ProxyAuthMode.ACCESS_TOKEN.name)
                    .uri(gatewayProperties.services.userServiceUrl)
            }
            .route("subscription-service") { route ->
                route.path(
                    "/users/me/subscriptions",
                    "/users/*/subscriptions",
                    "/users/*/subscriptions/status",
                    "/activity"
                )
                    .metadata(AUTH_MODE_METADATA_KEY, ProxyAuthMode.INTERNAL_TOKEN.name)
                    .metadata(
                        INTERNAL_TOKEN_AUDIENCE_METADATA_KEY,
                        gatewayProperties.internalTokenAudiences.subscriptionService
                    )
                    .uri(gatewayProperties.services.subscriptionServiceUrl)
            }
            .route("review-service-authorized") { route ->
                route.path(
                    "/api/flags/**",
                    "/api/companies/**",
                    "/api/users/me/flags",
                    "/api/users/*/flags",
                    "/api/users/flags",
                    "/api/users/me/reviews",
                    "/api/users/*/reviews",
                    "/api/users/reviews/**"
                )
                    .metadata(AUTH_MODE_METADATA_KEY, ProxyAuthMode.INTERNAL_TOKEN.name)
                    .metadata(
                        INTERNAL_TOKEN_AUDIENCE_METADATA_KEY,
                        gatewayProperties.internalTokenAudiences.reviewService
                    )
                    .uri(gatewayProperties.services.reviewServiceUrl)
            }
            .route("gamification-service-authorized") { route ->
                route.path(
                    "/api/users/me/achievements",
                    "/api/users/*/achievements",
                    "/api/users/me/level",
                    "/api/users/*/level"
                )
                    .metadata(AUTH_MODE_METADATA_KEY, ProxyAuthMode.INTERNAL_TOKEN.name)
                    .metadata(
                        INTERNAL_TOKEN_AUDIENCE_METADATA_KEY,
                        gatewayProperties.internalTokenAudiences.gamificationService
                    )
                    .uri(gatewayProperties.services.gamificationServiceUrl)
            }
            .build()
    }

    companion object {
        const val AUTH_MODE_METADATA_KEY = "gateway.auth-mode"
        const val INTERNAL_TOKEN_AUDIENCE_METADATA_KEY = "gateway.internal-token-audience"
    }
}
