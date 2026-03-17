package com.vibecheck.gatewayservice.security

import com.vibecheck.gatewayservice.client.UserServiceClient
import com.vibecheck.gatewayservice.config.GatewayProperties

package com.vibecheck.gateway.security


import org.springframework.http.HttpHeaders
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.web.server.authentication.AuthenticationWebFilter
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono

@Component
class AccessTokenAuthenticationFilter(
    private val userServiceClient: UserServiceClient,
    private val gatewayProperties: GatewayProperties
) : AuthenticationWebFilter({ authentication ->
    Mono.just(authentication)
}) {

    init {
        setSecurityContextRepository(NoOpServerSecurityContextRepository.getInstance())

        setServerAuthenticationConverter { exchange ->
            if (isPublic(exchange)) {
                return@setServerAuthenticationConverter Mono.empty()
            }

            val rawHeader = exchange.request.headers.getFirst(HttpHeaders.AUTHORIZATION)
                ?: return@setServerAuthenticationConverter Mono.error(
                    BadCredentialsException("Missing Authorization header")
                )

            if (!rawHeader.startsWith("OAuth ")) {
                return@setServerAuthenticationConverter Mono.error(
                    BadCredentialsException("Authorization header must use OAuth scheme")
                )
            }

            val accessToken = rawHeader.removePrefix("OAuth ").trim()
            if (accessToken.isBlank()) {
                return@setServerAuthenticationConverter Mono.error(
                    BadCredentialsException("Access token is blank")
                )
            }

            userServiceClient.authorizeByAccessToken(accessToken)
                .map { authResponse ->
                    GatewayAuthenticationToken(
                        AuthenticatedUser(
                            userId = authResponse.userId,
                            email = authResponse.email,
                            roles = authResponse.roles,
                            internalToken = authResponse.internalToken
                        )
                    )
                }
        }

        setAuthenticationSuccessHandler { webFilterExchange, authentication ->
            val exchange = webFilterExchange.exchange
            val authToken = authentication as GatewayAuthenticationToken
            val principal = authToken.principal as AuthenticatedUser

            exchange.attributes[INTERNAL_TOKEN_ATTRIBUTE] = principal.internalToken
            webFilterExchange.chain.filter(exchange)
        }

        setAuthenticationFailureHandler { webFilterExchange, exception ->
            Mono.error(exception)
        }
    }

    private fun isPublic(exchange: ServerWebExchange): Boolean {
        val path = exchange.request.path.pathWithinApplication()
        return gatewayProperties.publicPaths.any { pattern ->
            PathPatternParserServerWebExchangeMatcher(pattern)
                .matches(exchange)
                .map { it.isMatch }
                .defaultIfEmpty(false)
                .block() == true
        }
    }

    companion object {
        const val INTERNAL_TOKEN_ATTRIBUTE = "gateway.internal-token"
    }
}