package com.vibecheck.subscriptionservice.security.session

import java.time.Instant
import java.util.UUID

data class RefreshSession(
    val id: UUID,
    val userId: UUID,
    val sessionId: UUID,
    val tokenHash: String,
    val expiresAt: Instant,
    val createdAt: Instant,
    val rotatedAt: Instant?,
    val revokedAt: Instant?,
    val replacedByTokenHash: String?,
    val reason: String?
)