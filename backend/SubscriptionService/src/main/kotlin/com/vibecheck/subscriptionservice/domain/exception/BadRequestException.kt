package com.vibecheck.subscriptionservice.domain.exception

class BadRequestException(
    override val message: String
): RuntimeException(message) {
}