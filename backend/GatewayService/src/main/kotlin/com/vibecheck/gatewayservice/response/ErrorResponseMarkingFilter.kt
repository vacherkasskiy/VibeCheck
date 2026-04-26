package com.vibecheck.gatewayservice.response

import org.springframework.cloud.gateway.filter.GatewayFilterChain
import org.springframework.cloud.gateway.filter.GlobalFilter
import org.springframework.core.Ordered
import org.springframework.http.HttpStatusCode
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono

@Component
class ErrorResponseMarkingFilter : GlobalFilter, Ordered {

    override fun filter(exchange: ServerWebExchange, chain: GatewayFilterChain): Mono<Void> {
        exchange.response.beforeCommit {
            val statusCode = exchange.response.statusCode
            if (statusCode != null && statusCode.isError()) {
                val source = exchange.getAttribute<String>(ErrorResponseMetadata.ERROR_SOURCE_ATTRIBUTE)
                    ?: ErrorSource.UPSTREAM.value

                exchange.response.headers.set(ErrorResponseMetadata.ERROR_SOURCE_HEADER, source)

                exchange.getAttribute<String>(ErrorResponseMetadata.UPSTREAM_SERVICE_ATTRIBUTE)
                    ?.takeIf { it.isNotBlank() }
                    ?.let { upstreamService ->
                        exchange.response.headers.set(ErrorResponseMetadata.UPSTREAM_SERVICE_HEADER, upstreamService)
                    }
            }

            Mono.empty()
        }

        return chain.filter(exchange)
    }

    override fun getOrder(): Int = Ordered.HIGHEST_PRECEDENCE
}
