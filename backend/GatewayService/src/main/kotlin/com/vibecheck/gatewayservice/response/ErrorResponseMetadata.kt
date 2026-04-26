package com.vibecheck.gatewayservice.response

object ErrorResponseMetadata {
    const val ERROR_SOURCE_HEADER = "X-VibeCheck-Error-Source"
    const val UPSTREAM_SERVICE_HEADER = "X-VibeCheck-Upstream-Service"
    const val ERROR_SOURCE_ATTRIBUTE = "gateway.error-source"
    const val UPSTREAM_SERVICE_ATTRIBUTE = "gateway.upstream-service"
}
