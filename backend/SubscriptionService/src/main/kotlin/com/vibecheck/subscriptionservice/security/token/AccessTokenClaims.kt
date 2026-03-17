package com.vibecheck.subscriptionservice.security.token

import java.time.Instant
import java.util.UUID

data class AccessTokenClaims(
    val subject: UUID,
    val sessionId: UUID,
    val tokenId: UUID,
    val tokenVersion: Long,
    val issuedAt: Instant,
    val expiresAt: Instant
)