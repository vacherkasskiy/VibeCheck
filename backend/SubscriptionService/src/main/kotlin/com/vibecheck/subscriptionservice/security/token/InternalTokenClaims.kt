package com.vibecheck.subscriptionservice.security.token

import com.vibecheck.userservice.domain.UserRole
import java.time.Instant
import java.util.UUID

data class InternalTokenClaims(
    val subject: UUID,
    val sessionId: UUID,
    val tokenId: UUID,
    val tokenVersion: Long,
    val name: String,
    val email: String,
    val roles: List<UserRole>,
    val issuedAt: Instant,
    val expiresAt: Instant
)