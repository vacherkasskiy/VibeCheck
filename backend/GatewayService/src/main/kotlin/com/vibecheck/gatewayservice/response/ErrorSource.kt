package com.vibecheck.gatewayservice.response

enum class ErrorSource(
    val value: String
) {
    GATEWAY("gateway"),
    UPSTREAM("upstream")
}
