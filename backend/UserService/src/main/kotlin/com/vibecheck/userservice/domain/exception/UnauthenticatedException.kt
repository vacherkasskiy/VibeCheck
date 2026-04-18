package com.vibecheck.userservice.domain.exception

class UnauthenticatedException(
    message: String = "User is not authenticated",
) : RuntimeException(message)
