package com.vibecheck.subscriptionservice.security

import java.util.UUID

data class AuthenticatedUserPrincipal(
    val userId: UUID,
    val sessionId: UUID,
    val tokenId: UUID,
    val tokenVersion: Long
)