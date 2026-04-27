package com.vibecheck.gatewayservice.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.vibecheck.gatewayservice.config.GatewayProperties
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono
import java.net.URI

@RestController
@RequestMapping("/gateway-api-docs")
class DownstreamOpenApiController(
    private val webClient: WebClient,
    private val objectMapper: ObjectMapper,
    private val gatewayProperties: GatewayProperties
) {

    @GetMapping("/{serviceName}", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getDownstreamOpenApi(
        @PathVariable serviceName: String,
        exchange: ServerWebExchange
    ): Mono<ResponseEntity<String>> {
        val descriptor = serviceDescriptors[serviceName]
            ?: return Mono.just(ResponseEntity.notFound().build())

        return webClient.get()
            .uri(descriptor.openapiUri(gatewayProperties))
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .bodyToMono(String::class.java)
            .map { rawSpec ->
                val rewrittenSpec = rewriteServers(rawSpec, gatewayBaseUrl(exchange))

                ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(rewrittenSpec)
            }
    }

    private fun rewriteServers(rawSpec: String, gatewayBaseUrl: String): String {
        val root = objectMapper.readTree(rawSpec) as? ObjectNode ?: return rawSpec
        filterPaths(root)
        val servers = objectMapper.createArrayNode()
            .addObject()
            .put("url", gatewayBaseUrl)

        root.set<ArrayNode>("servers", servers)
        return objectMapper.writeValueAsString(root)
    }

    private fun filterPaths(root: ObjectNode) {
        val paths = root.get("paths") as? ObjectNode ?: return
        val pathNamesToRemove = paths.fieldNames().asSequence()
            .filter(::shouldHidePath)
            .toList()

        pathNamesToRemove.forEach(paths::remove)
    }

    private fun shouldHidePath(path: String): Boolean {
        return path.startsWith("/internal") || path.contains("test-auth", ignoreCase = true)
    }

    private fun gatewayBaseUrl(exchange: ServerWebExchange): String {
        val requestUri = exchange.request.uri
        val portSuffix = when {
            requestUri.port == -1 -> ""
            requestUri.scheme == "http" && requestUri.port == 80 -> ""
            requestUri.scheme == "https" && requestUri.port == 443 -> ""
            else -> ":${requestUri.port}"
        }

        return "${requestUri.scheme}://${requestUri.host}$portSuffix"
    }

    private data class ServiceDescriptor(
        val serviceName: String,
        val baseUrl: (GatewayProperties) -> String,
        val docsPath: String
    ) {
        fun openapiUri(properties: GatewayProperties): URI {
            return URI.create("${baseUrl(properties).trimEnd('/')}$docsPath")
        }
    }

    companion object {
        private val serviceDescriptors = listOf(
            ServiceDescriptor(
                serviceName = "user-service",
                baseUrl = { it.services.userServiceUrl },
                docsPath = "/v3/api-docs"
            ),
            ServiceDescriptor(
                serviceName = "subscription-service",
                baseUrl = { it.services.subscriptionServiceUrl },
                docsPath = "/v3/api-docs"
            ),
            ServiceDescriptor(
                serviceName = "review-service",
                baseUrl = { it.services.reviewServiceUrl },
                docsPath = "/swagger/v1/swagger.json"
            ),
            ServiceDescriptor(
                serviceName = "gamification-service",
                baseUrl = { it.services.gamificationServiceUrl },
                docsPath = "/swagger/v1/swagger.json"
            )
        ).associateBy(ServiceDescriptor::serviceName)
    }
}
