package com.vibecheck.gatewayservice.security

data class AuthenticatedUser(
    val userId: String,
    val email: String,
    val roles: List<String>,
    val internalToken: String
)