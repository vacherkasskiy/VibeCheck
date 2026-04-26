package com.vibecheck.gatewayservice.client

import com.vibecheck.gatewayservice.config.GatewayProperties
import com.vibecheck.gatewayservice.dto.InternalAuthorizationRequest
import com.vibecheck.gatewayservice.dto.InternalAuthorizationResponse
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono
import reactor.core.publisher.Mono

@Component
class UserServiceClient(
    private val webClient: WebClient,
    private val gatewayProperties: GatewayProperties
) {

    fun authorizeByAccessToken(accessToken: String, audience: String): Mono<String> {
        return webClient.post()
            .uri("${gatewayProperties.services.userServiceUrl}/auth/internal")
            .header(HttpHeaders.AUTHORIZATION, "Bearer $accessToken")
            .bodyValue(
                InternalAuthorizationRequest(
                    audiences = listOf(audience)
                )
            )
            .exchangeToMono { response ->
                if (response.statusCode().is2xxSuccessful) {
                    response.bodyToMono<InternalAuthorizationResponse>()
                        .map { it.token }
                } else {
                    response.bodyToMono<ByteArray>()
                        .defaultIfEmpty(ByteArray(0))
                        .flatMap { body ->
                            Mono.error(
                                UpstreamServiceException(
                                    statusCode = response.statusCode().value(),
                                    headers = response.headers().asHttpHeaders(),
                                    body = body
                                )
                            )
                        }
                }
            }
    }
}
