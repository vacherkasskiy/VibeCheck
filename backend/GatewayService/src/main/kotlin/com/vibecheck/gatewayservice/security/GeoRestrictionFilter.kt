package com.vibecheck.gatewayservice.security

import com.vibecheck.gatewayservice.config.GeoRestrictionProperties
import com.vibecheck.gatewayservice.response.ErrorResponseMetadata
import com.vibecheck.gatewayservice.response.ErrorSource
import org.springframework.cloud.gateway.filter.GatewayFilterChain
import org.springframework.cloud.gateway.filter.GlobalFilter
import org.springframework.core.Ordered
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono
import java.net.InetAddress

@Component
class GeoRestrictionFilter(
    private val geoRestrictionProperties: GeoRestrictionProperties
) : GlobalFilter, Ordered {

    private val allowedCountryCodes = geoRestrictionProperties.allowedCountryCodes
        .map { it.trim().uppercase() }
        .filter { it.isNotEmpty() }
        .toSet()

    override fun filter(exchange: ServerWebExchange, chain: GatewayFilterChain): Mono<Void> {
        if (!geoRestrictionProperties.enabled || exchange.request.method == HttpMethod.OPTIONS) {
            return chain.filter(exchange)
        }

        if (geoRestrictionProperties.allowPrivateIpBypass && exchange.clientIpAddress()?.isPrivateOrLoopback() == true) {
            return chain.filter(exchange)
        }

        val countryCode = exchange.request.headers
            .getFirst(geoRestrictionProperties.countryHeader)
            ?.trim()
            ?.uppercase()

        if (countryCode.isNullOrEmpty()) {
            return if (geoRestrictionProperties.failOnMissingHeader) {
                writeForbidden(
                    exchange,
                    "Missing trusted geo header '${geoRestrictionProperties.countryHeader}'"
                )
            } else {
                chain.filter(exchange)
            }
        }

        if (countryCode !in allowedCountryCodes) {
            return writeForbidden(
                exchange,
                "Access is allowed only from Russian IP addresses"
            )
        }

        return chain.filter(exchange)
    }

    override fun getOrder(): Int = Ordered.HIGHEST_PRECEDENCE + 10

    private fun writeForbidden(exchange: ServerWebExchange, message: String): Mono<Void> {
        val response = exchange.response
        exchange.attributes[ErrorResponseMetadata.ERROR_SOURCE_ATTRIBUTE] = ErrorSource.GATEWAY.value
        response.statusCode = HttpStatus.FORBIDDEN
        response.headers.set(ErrorResponseMetadata.ERROR_SOURCE_HEADER, ErrorSource.GATEWAY.value)
        response.headers.contentType = MediaType.APPLICATION_JSON

        val body = """
            {
              "code": "GEO_RESTRICTED",
              "message": "${escapeJson(message)}",
              "source": "${ErrorSource.GATEWAY.value}"
            }
        """.trimIndent()

        val buffer = response.bufferFactory().wrap(body.toByteArray(Charsets.UTF_8))
        return response.writeWith(Mono.just(buffer))
    }

    private fun ServerWebExchange.clientIpAddress(): InetAddress? {
        val xForwardedFor = request.headers.getFirst("X-Forwarded-For")
            ?.split(',')
            ?.asSequence()
            ?.map { it.trim() }
            ?.firstOrNull { it.isNotEmpty() }

        val candidate = xForwardedFor ?: request.remoteAddress?.address?.hostAddress
        return candidate?.toInetAddressOrNull()
    }

    private fun String.toInetAddressOrNull(): InetAddress? {
        val sanitized = removePrefix("[").substringBefore(']').substringBefore('%').trim()
        return runCatching { InetAddress.getByName(sanitized) }.getOrNull()
    }

    private fun InetAddress.isPrivateOrLoopback(): Boolean =
        isAnyLocalAddress || isLoopbackAddress || isSiteLocalAddress || isLinkLocalAddress

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
