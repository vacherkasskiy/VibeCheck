package com.vibecheck.userservice.usecase.cache

import java.time.Duration
import java.util.UUID

interface RevokedAccessTokenRepository {
    fun revoke(tokenId: UUID, ttl: Duration)
    fun isRevoked(tokenId: UUID): Boolean
}