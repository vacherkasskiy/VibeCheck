package com.vibecheck.userservice.domain.auth

import java.time.Instant
import java.util.UUID

data class UserLoginDevice(
    val userId: UUID,
    val fingerprint: String,
    val userAgent: String,
    val ipAddress: String?,
    val createdAt: Instant,
) {
    companion object {
        fun new(
            userId: UUID,
            fingerprint: String,
            userAgent: String,
            ipAddress: String?,
            createdAt: Instant,
        ): UserLoginDevice = UserLoginDevice(
            userId = userId,
            fingerprint = fingerprint,
            userAgent = userAgent,
            ipAddress = ipAddress,
            createdAt = createdAt,
        )
    }
}
