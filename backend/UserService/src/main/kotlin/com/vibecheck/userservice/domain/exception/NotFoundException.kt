package com.vibecheck.userservice.domain.exception

class NotFoundException(
    override val message: String,
): RuntimeException(message) {
}