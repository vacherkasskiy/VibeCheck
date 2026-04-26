package com.vibecheck.userservice.domain.exception

class InternalTokenException(
    message: String,
    cause: Throwable? = null,
) : RuntimeException(message, cause)
