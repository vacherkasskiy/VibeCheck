package com.vibecheck.userservice.domain.exception

class BadRequestException(
    override val message: String
): RuntimeException(message) {
}