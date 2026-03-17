package com.vibecheck.gatewayservice.security

import org.springframework.cloud.gateway.filter.GatewayFilterChain
import org.springframework.cloud.gateway.filter.GlobalFilter
import org.springframework.core.Ordered
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono

@Component
class InternalTokenRelayFilter : GlobalFilter, Ordered {

    override fun filter(exchange: ServerWebExchange, chain: GatewayFilterChain): Mono<Void> {
        val internalToken = exchange.getAttribute<String>(AccessTokenAuthenticationFilter.INTERNAL_TOKEN_ATTRIBUTE)

        if (internalToken.isNullOrBlank()) {
            return chain.filter(exchange)
        }

        val mutatedRequest = exchange.request.mutate()
            .headers { headers ->
                headers.remove(HttpHeaders.AUTHORIZATION)
                headers.add(HttpHeaders.AUTHORIZATION, "Bearer $internalToken")
            }
            .build()

        val mutatedExchange = exchange.mutate()
            .request(mutatedRequest)
            .build()

        return chain.filter(mutatedExchange)
    }

    override fun getOrder(): Int = -1
}