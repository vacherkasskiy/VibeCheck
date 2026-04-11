package com.vibecheck.userservice.security.jwt

import java.time.Instant
import java.util.UUID

data class RefreshTokenClaims(
    val tokenId: String,
    val userId: UUID,
    val expiresAt: Instant
)