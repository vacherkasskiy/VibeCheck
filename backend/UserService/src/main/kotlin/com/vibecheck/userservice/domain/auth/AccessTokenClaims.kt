package com.vibecheck.userservice.domain.auth

import com.vibecheck.userservice.domain.UserRole
import java.time.Instant
import java.util.UUID

data class AccessTokenClaims(
    val tokenId: String,
    val userId: UUID,
    val roles: List<UserRole>,
    val expiresAt: Instant
)