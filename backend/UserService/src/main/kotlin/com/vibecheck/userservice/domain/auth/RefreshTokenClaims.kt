package com.vibecheck.userservice.domain.auth

import java.time.Instant
import java.util.UUID

data class RefreshTokenClaims(
    val tokenId: String,
    val userId: UUID,
    val expiresAt: Instant
)