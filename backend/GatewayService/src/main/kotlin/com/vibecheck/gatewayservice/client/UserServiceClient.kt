package com.vibecheck.gatewayservice.client

import com.vibecheck.gatewayservice.config.GatewayProperties
import com.vibecheck.gatewayservice.dto.InternalAuthorizationRequest
import com.vibecheck.gatewayservice.dto.InternalAuthorizationResponse
import com.vibecheck.gatewayservice.dto.ServiceErrorResponse
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@Component
class UserServiceClient(
    private val webClient: WebClient,
    private val gatewayProperties: GatewayProperties
) {

    fun authorizeByAccessToken(accessToken: String): Mono<InternalAuthorizationResponse> {
        return webClient.post()
            .uri("${gatewayProperties.services.userServiceUrl}/api/v1/auth/internal")
            .header(HttpHeaders.AUTHORIZATION, "OAuth $accessToken")
            .bodyValue(InternalAuthorizationRequest(accessToken))
            .retrieve()
            .onStatus(HttpStatus.UNAUTHORIZED::equals) { response ->
                response.bodyToMono(ServiceErrorResponse::class.java)
                    .defaultIfEmpty(ServiceErrorResponse(message = "Invalid access token"))
                    .flatMap { error ->
                        Mono.error(
                            InvalidTokenException(
                                error.message ?: "Invalid access token"
                            )
                        )
                    }
            }
            .onStatus(HttpStatus.BAD_REQUEST::equals) { response ->
                response.bodyToMono(ServiceErrorResponse::class.java)
                    .defaultIfEmpty(ServiceErrorResponse(message = "Bad request to user service"))
                    .flatMap { error ->
                        Mono.error(
                            InternalServiceException(
                                status = HttpStatus.BAD_REQUEST,
                                message = error.message ?: "Bad request to user service"
                            )
                        )
                    }
            }
            .onStatus(HttpStatus::is5xxServerError) { response ->
                response.bodyToMono(ServiceErrorResponse::class.java)
                    .defaultIfEmpty(ServiceErrorResponse(message = "User service is unavailable"))
                    .flatMap { error ->
                        Mono.error(
                            InternalServiceException(
                                status = response.statusCode(),
                                message = error.message ?: "User service is unavailable"
                            )
                        )
                    }
            }
            .bodyToMono(InternalAuthorizationResponse::class.java)
    }
}