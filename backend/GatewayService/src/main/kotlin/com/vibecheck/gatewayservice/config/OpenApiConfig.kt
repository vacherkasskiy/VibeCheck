package com.vibecheck.gatewayservice.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.PathItem
import io.swagger.v3.oas.models.Paths
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.media.Content
import io.swagger.v3.oas.models.media.MediaType
import io.swagger.v3.oas.models.media.ObjectSchema
import io.swagger.v3.oas.models.responses.ApiResponse
import io.swagger.v3.oas.models.responses.ApiResponses
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import io.swagger.v3.oas.models.tags.Tag
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    @Bean
    fun gatewayOpenApi(): OpenAPI {
        val paths = Paths()

        endpointSpecs().forEach { spec ->
            val pathItem = paths[spec.path] ?: PathItem()
            pathItem.operation(spec.method, spec.toOperation())
            paths.addPathItem(spec.path, pathItem)
        }

        return OpenAPI()
            .info(
                Info()
                    .title("VibeCheck Gateway API")
                    .version("1.0")
                    .description("Proxy API grouped by downstream service")
            )
            .tags(
                listOf(
                    Tag().name(USER_SERVICE_TAG).description("Requests proxied to UserService"),
                    Tag().name(SUBSCRIPTION_SERVICE_TAG).description("Requests proxied to SubscriptionService"),
                    Tag().name(REVIEW_SERVICE_TAG).description("Requests proxied to ReviewService"),
                    Tag().name(GAMIFICATION_SERVICE_TAG).description("Requests proxied to GamificationService")
                )
            )
            .components(
                Components()
                    .addSecuritySchemes(
                        "BearerAuth",
                        SecurityScheme()
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")
                    )
            )
            .paths(paths)
    }

    private fun endpointSpecs(): List<EndpointSpec> = listOf(
        EndpointSpec("/auth/email/register", HttpMethod.POST, USER_SERVICE_TAG, "Register user by email", false),
        EndpointSpec("/auth/email/login", HttpMethod.POST, USER_SERVICE_TAG, "Login user by email", false),
        EndpointSpec("/auth/email/register/confirm", HttpMethod.POST, USER_SERVICE_TAG, "Confirm email registration", false),
        EndpointSpec("/auth/refresh", HttpMethod.POST, USER_SERVICE_TAG, "Refresh access token", false),
        EndpointSpec("/auth/email/password/reset", HttpMethod.POST, USER_SERVICE_TAG, "Start password reset", false),
        EndpointSpec("/auth/email/password/reset", HttpMethod.PUT, USER_SERVICE_TAG, "Confirm password reset", false),
        EndpointSpec("/auth/internal", HttpMethod.POST, USER_SERVICE_TAG, "Generate internal token", true),
        EndpointSpec("/auth/logout", HttpMethod.POST, USER_SERVICE_TAG, "Logout current user", true),
        EndpointSpec("/avatars", HttpMethod.GET, USER_SERVICE_TAG, "Get available avatars", true),
        EndpointSpec("/onboarding/step", HttpMethod.GET, USER_SERVICE_TAG, "Get current onboarding step", true),
        EndpointSpec("/onboarding/step", HttpMethod.POST, USER_SERVICE_TAG, "Complete current onboarding step", true),
        EndpointSpec("/users/me/info", HttpMethod.GET, USER_SERVICE_TAG, "Get current user info", true),
        EndpointSpec("/users/{userId}/info", HttpMethod.GET, USER_SERVICE_TAG, "Get user info by id", true),
        EndpointSpec("/users/info", HttpMethod.POST, USER_SERVICE_TAG, "Create current user profile", true),
        EndpointSpec("/users/info", HttpMethod.PUT, USER_SERVICE_TAG, "Update current user profile", true),
        EndpointSpec("/users/{userId}/reports", HttpMethod.POST, USER_SERVICE_TAG, "Create report for user", true),

        EndpointSpec("/users/me/subscriptions", HttpMethod.GET, SUBSCRIPTION_SERVICE_TAG, "Get my subscriptions", true),
        EndpointSpec("/users/{userId}/subscriptions", HttpMethod.GET, SUBSCRIPTION_SERVICE_TAG, "Get user subscriptions", true),
        EndpointSpec("/users/{authorId}/subscriptions", HttpMethod.POST, SUBSCRIPTION_SERVICE_TAG, "Create subscription", true),
        EndpointSpec("/users/{authorId}/subscriptions", HttpMethod.DELETE, SUBSCRIPTION_SERVICE_TAG, "Delete subscription", true),
        EndpointSpec("/users/{authorId}/subscriptions/status", HttpMethod.GET, SUBSCRIPTION_SERVICE_TAG, "Get subscription status", true),
        EndpointSpec("/activity", HttpMethod.GET, SUBSCRIPTION_SERVICE_TAG, "Get subscription activity feed", true),

        EndpointSpec("/api/flags", HttpMethod.GET, REVIEW_SERVICE_TAG, "Get all flags", true),
        EndpointSpec("/api/companies", HttpMethod.GET, REVIEW_SERVICE_TAG, "Get companies list", true),
        EndpointSpec("/api/companies", HttpMethod.POST, REVIEW_SERVICE_TAG, "Create company request", true),
        EndpointSpec("/api/companies/{companyId}", HttpMethod.GET, REVIEW_SERVICE_TAG, "Get company page", true),
        EndpointSpec("/api/companies/{companyId}/flags", HttpMethod.GET, REVIEW_SERVICE_TAG, "Get company flags", true),
        EndpointSpec("/api/companies/{companyId}/reviews", HttpMethod.POST, REVIEW_SERVICE_TAG, "Create company review", true),
        EndpointSpec("/api/companies/{companyId}/reviews", HttpMethod.GET, REVIEW_SERVICE_TAG, "Get company reviews", true),
        EndpointSpec("/api/companies/reviews/{reviewId}", HttpMethod.PATCH, REVIEW_SERVICE_TAG, "Update company review", true),
        EndpointSpec("/api/companies/reviews/{reviewId}", HttpMethod.DELETE, REVIEW_SERVICE_TAG, "Delete company review", true),
        EndpointSpec("/api/users/me/reviews", HttpMethod.GET, REVIEW_SERVICE_TAG, "Get my reviews", true),
        EndpointSpec("/api/users/{userId}/reviews", HttpMethod.GET, REVIEW_SERVICE_TAG, "Get user reviews", true),
        EndpointSpec("/api/users/reviews/{reviewId}/vote", HttpMethod.PATCH, REVIEW_SERVICE_TAG, "Vote for review", true),
        EndpointSpec("/api/users/reviews/{reviewId}/report", HttpMethod.POST, REVIEW_SERVICE_TAG, "Report review", true),
        EndpointSpec("/api/users/me/flags", HttpMethod.GET, REVIEW_SERVICE_TAG, "Get my flags", true),
        EndpointSpec("/api/users/{userId}/flags", HttpMethod.GET, REVIEW_SERVICE_TAG, "Get user flags", true),
        EndpointSpec("/api/users/flags", HttpMethod.PUT, REVIEW_SERVICE_TAG, "Set my flags", true),

        EndpointSpec("/api/users/me/achievements", HttpMethod.GET, GAMIFICATION_SERVICE_TAG, "Get my achievements", true),
        EndpointSpec("/api/users/{userId}/achievements", HttpMethod.GET, GAMIFICATION_SERVICE_TAG, "Get user achievements", true),
        EndpointSpec("/api/users/me/level", HttpMethod.GET, GAMIFICATION_SERVICE_TAG, "Get my level", true),
        EndpointSpec("/api/users/{userId}/level", HttpMethod.GET, GAMIFICATION_SERVICE_TAG, "Get user level", true)
    )

    private fun EndpointSpec.toOperation() =
        io.swagger.v3.oas.models.Operation()
            .addTagsItem(tag)
            .summary(summary)
            .responses(defaultResponses())
            .apply {
                if (secured) {
                    addSecurityItem(SecurityRequirement().addList("BearerAuth"))
                }
            }

    private fun defaultResponses(): ApiResponses = ApiResponses()
        .addApiResponse(
            "200",
            ApiResponse()
                .description("OK")
                .content(jsonContent())
        )
        .addApiResponse(
            "204",
            ApiResponse().description("No Content")
        )
        .addApiResponse(
            "400",
            ApiResponse()
                .description("Bad Request")
                .content(jsonContent())
        )
        .addApiResponse(
            "401",
            ApiResponse()
                .description("Unauthorized")
                .content(jsonContent())
        )
        .addApiResponse(
            "403",
            ApiResponse()
                .description("Forbidden")
                .content(jsonContent())
        )
        .addApiResponse(
            "404",
            ApiResponse()
                .description("Not Found")
                .content(jsonContent())
        )
        .addApiResponse(
            "500",
            ApiResponse()
                .description("Internal Server Error")
                .content(jsonContent())
        )

    private fun jsonContent(): Content = Content().addMediaType(
        "application/json",
        MediaType().schema(ObjectSchema())
    )

    private fun PathItem.operation(method: HttpMethod, operation: io.swagger.v3.oas.models.Operation) {
        when (method) {
            HttpMethod.GET -> get = operation
            HttpMethod.POST -> post = operation
            HttpMethod.PUT -> put = operation
            HttpMethod.PATCH -> patch = operation
            HttpMethod.DELETE -> delete = operation
        }
    }

    private data class EndpointSpec(
        val path: String,
        val method: HttpMethod,
        val tag: String,
        val summary: String,
        val secured: Boolean
    )

    private enum class HttpMethod {
        GET,
        POST,
        PUT,
        PATCH,
        DELETE
    }

    companion object {
        private const val USER_SERVICE_TAG = "UserService"
        private const val SUBSCRIPTION_SERVICE_TAG = "SubscriptionService"
        private const val REVIEW_SERVICE_TAG = "ReviewService"
        private const val GAMIFICATION_SERVICE_TAG = "GamificationService"
    }
}
