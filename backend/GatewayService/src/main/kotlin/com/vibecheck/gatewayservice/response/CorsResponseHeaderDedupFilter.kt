package com.vibecheck.gatewayservice.response

import org.springframework.cloud.gateway.filter.GatewayFilterChain
import org.springframework.cloud.gateway.filter.GlobalFilter
import org.springframework.core.Ordered
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono

@Component
class CorsResponseHeaderDedupFilter : GlobalFilter, Ordered {

    override fun filter(exchange: ServerWebExchange, chain: GatewayFilterChain): Mono<Void> {
        exchange.response.beforeCommit {
            dedupeHeader(exchange, HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN)
            dedupeHeader(exchange, HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS)
            dedupeHeader(exchange, HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS)
            dedupeHeader(exchange, HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS)
            dedupeHeader(exchange, HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS)
            Mono.empty()
        }

        return chain.filter(exchange)
    }

    override fun getOrder(): Int = Ordered.HIGHEST_PRECEDENCE

    private fun dedupeHeader(exchange: ServerWebExchange, headerName: String) {
        val responseHeaders = exchange.response.headers
        val values = responseHeaders[headerName]
            ?.flatMap { headerValue -> headerValue.split(",").map(String::trim) }
            ?.filter { it.isNotBlank() }
            ?.distinct()
            ?: return

        if (values.isEmpty()) {
            responseHeaders.remove(headerName)
            return
        }

        responseHeaders.set(headerName, values.joinToString(", "))
    }
}
