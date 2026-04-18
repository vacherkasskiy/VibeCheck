package com.vibecheck.userservice.domain.auth

import java.time.Instant

data class GeneratedToken(
    val token: String,
    val tokenId: String,
    val issuedAt: Instant,
    val expiresAt: Instant
)