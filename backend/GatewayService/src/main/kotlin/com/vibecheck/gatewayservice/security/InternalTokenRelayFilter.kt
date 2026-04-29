package com.vibecheck.gatewayservice.security

import com.vibecheck.gatewayservice.client.UpstreamServiceException
import com.vibecheck.gatewayservice.client.UserServiceClient
import com.vibecheck.gatewayservice.config.GatewayRoutesConfig
import com.vibecheck.gatewayservice.config.ProxyAuthMode
import com.vibecheck.gatewayservice.exception.InvalidTokenException
import com.vibecheck.gatewayservice.response.ErrorResponseMetadata
import com.vibecheck.gatewayservice.response.ErrorSource
import org.springframework.cloud.gateway.filter.GatewayFilterChain
import org.springframework.cloud.gateway.filter.GlobalFilter
import org.springframework.cloud.gateway.route.Route
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR
import org.springframework.core.Ordered
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono

@Component
class InternalTokenRelayFilter(
    private val userServiceClient: UserServiceClient
    ) : GlobalFilter, Ordered {

    override fun filter(exchange: ServerWebExchange, chain: GatewayFilterChain): Mono<Void> {
        if (exchange.request.method == HttpMethod.OPTIONS) {
            return chain.filter(exchange)
        }

        val route = exchange.getAttribute<Route>(GATEWAY_ROUTE_ATTR)
        val authMode = route.requiredMetadata(GatewayRoutesConfig.AUTH_MODE_METADATA_KEY)
            .let { ProxyAuthMode.valueOf(it) }

        val result = when (authMode) {
            ProxyAuthMode.NONE -> chain.filter(exchange)
            ProxyAuthMode.ACCESS_TOKEN -> relayAccessToken(exchange, chain)
            ProxyAuthMode.INTERNAL_TOKEN -> relayInternalToken(exchange, chain, route)
        }

        return result
            .onErrorResume(InvalidTokenException::class.java) { ex ->
                writeError(exchange, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", ex.message ?: "Invalid access token")
            }
            .onErrorResume(UpstreamServiceException::class.java) { ex ->
                writeUpstreamResponse(exchange, ex)
            }
            .onErrorResume(IllegalStateException::class.java) { ex ->
                writeError(
                    exchange,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "GATEWAY_CONFIGURATION_ERROR",
                    ex.message ?: "Invalid gateway route configuration"
                )
            }
    }

    private fun relayAccessToken(exchange: ServerWebExchange, chain: GatewayFilterChain): Mono<Void> {
        val accessToken = extractAccessToken(exchange)
        return chain.filter(exchange.withAuthorization("Bearer $accessToken"))
    }

    private fun relayInternalToken(
        exchange: ServerWebExchange,
        chain: GatewayFilterChain,
        route: Route?
    ): Mono<Void> {
        val accessToken = extractAccessToken(exchange)
        val audience = route.requiredMetadata(GatewayRoutesConfig.INTERNAL_TOKEN_AUDIENCE_METADATA_KEY)
        exchange.attributes[ErrorResponseMetadata.UPSTREAM_SERVICE_ATTRIBUTE] = "user-service"

        return userServiceClient.authorizeByAccessToken(accessToken, audience)
            .flatMap { internalToken ->
                chain.filter(exchange.withAuthorization("Bearer $internalToken"))
            }
    }

    override fun getOrder(): Int = -1

    private fun extractAccessToken(exchange: ServerWebExchange): String {
        val rawHeader = exchange.request.headers.getFirst(HttpHeaders.AUTHORIZATION)
            ?: throw InvalidTokenException("Missing Authorization header")

        return when {
            rawHeader.startsWith("OAuth ") -> rawHeader.removePrefix("OAuth ").trim()
            rawHeader.startsWith("Bearer ") -> rawHeader.removePrefix("Bearer ").trim()
            else -> throw InvalidTokenException("Authorization header must use Bearer or OAuth scheme")
        }.takeIf { it.isNotBlank() }
            ?: throw InvalidTokenException("Access token is blank")
    }

    private fun ServerWebExchange.withAuthorization(authorization: String): ServerWebExchange {
        val mutatedRequest = request.mutate()
            .headers { headers ->
                headers.remove(HttpHeaders.AUTHORIZATION)
                headers.add(HttpHeaders.AUTHORIZATION, authorization)
            }
            .build()

        return mutate()
            .request(mutatedRequest)
            .build()
    }

    private fun writeError(
        exchange: ServerWebExchange,
        status: HttpStatus,
        code: String,
        message: String
    ): Mono<Void> {
        val response = exchange.response
        exchange.attributes[ErrorResponseMetadata.ERROR_SOURCE_ATTRIBUTE] = ErrorSource.GATEWAY.value
        response.statusCode = status
        response.headers.set(ErrorResponseMetadata.ERROR_SOURCE_HEADER, ErrorSource.GATEWAY.value)
        response.headers.contentType = MediaType.APPLICATION_JSON

        val body = """
            {
              "code": "$code",
              "message": "${escapeJson(message)}",
              "source": "${ErrorSource.GATEWAY.value}"
            }
        """.trimIndent()

        val buffer = response.bufferFactory().wrap(body.toByteArray(Charsets.UTF_8))
        return response.writeWith(Mono.just(buffer))
    }

    private fun writeUpstreamResponse(
        exchange: ServerWebExchange,
        exception: UpstreamServiceException
    ): Mono<Void> {
        val response = exchange.response
        exchange.attributes[ErrorResponseMetadata.ERROR_SOURCE_ATTRIBUTE] = ErrorSource.UPSTREAM.value
        response.statusCode = HttpStatus.valueOf(exception.statusCode)
        val preservedHeaders = HttpHeaders().apply {
            putAll(response.headers)
        }
        response.headers.clear()
        response.headers.addAll(preservedHeaders)
        response.headers.addAll(exception.headers.filteredForClient())
        response.headers.set(ErrorResponseMetadata.ERROR_SOURCE_HEADER, ErrorSource.UPSTREAM.value)

        val buffer = response.bufferFactory().wrap(exception.body)
        return response.writeWith(Mono.just(buffer))
    }

    private fun Route?.requiredMetadata(key: String): String {
        val routeId = this?.id ?: "<unknown>"
        return this?.metadata?.get(key)?.toString()?.takeIf { it.isNotBlank() }
            ?: throw IllegalStateException("Route '$routeId' is missing required metadata '$key'")
    }

    private fun HttpHeaders.filteredForClient(): HttpHeaders {
        val filteredHeaders = HttpHeaders()

        forEach { name, values ->
            if (!name.equals(HttpHeaders.TRANSFER_ENCODING, ignoreCase = true) &&
                !name.equals(HttpHeaders.CONTENT_LENGTH, ignoreCase = true) &&
                !name.equals(HttpHeaders.CONNECTION, ignoreCase = true)
            ) {
                filteredHeaders.put(name, values.toMutableList())
            }
        }

        if (filteredHeaders.contentType == null) {
            filteredHeaders.contentType = MediaType.APPLICATION_JSON
        }

        return filteredHeaders
    }

    private fun escapeJson(value: String): String =
        buildString(value.length) {
            value.forEach { char ->
                when (char) {
                    '\\' -> append("\\\\")
                    '"' -> append("\\\"")
                    '\n' -> append("\\n")
                    '\r' -> append("\\r")
                    '\t' -> append("\\t")
                    else -> append(char)
                }
            }
        }
}
