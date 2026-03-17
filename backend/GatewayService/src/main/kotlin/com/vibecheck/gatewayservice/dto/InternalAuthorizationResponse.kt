package com.vibecheck.gatewayservice.dto

data class InternalAuthorizationResponse(
    val userId: String,
    val email: String,
    val roles: List<String>,
    val internalToken: String
)