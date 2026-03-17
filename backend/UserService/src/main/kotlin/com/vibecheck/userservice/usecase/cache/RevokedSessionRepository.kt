package com.vibecheck.userservice.usecase.cache

import java.time.Duration
import java.util.UUID

interface RevokedSessionRepository {
    fun revoke(sessionId: UUID, ttl: Duration)
    fun isRevoked(sessionId: UUID): Boolean
}