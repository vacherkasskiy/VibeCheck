package com.vibecheck.subscriptionservice.domain.exception

class NotFoundException(
    override val message: String,
): RuntimeException(message) {
}