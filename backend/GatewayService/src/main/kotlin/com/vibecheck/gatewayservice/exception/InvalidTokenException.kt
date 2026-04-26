package com.vibecheck.gatewayservice.exception

import org.springframework.security.core.AuthenticationException

class InvalidTokenException(
    message: String = "Invalid access token"
) : AuthenticationException(message)