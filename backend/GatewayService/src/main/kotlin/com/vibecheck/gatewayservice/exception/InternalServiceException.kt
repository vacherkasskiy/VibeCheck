package com.vibecheck.gatewayservice.exception

import org.springframework.http.HttpStatus

class InternalServiceException(
    val status: HttpStatus,
    override val message: String
) : RuntimeException(message)