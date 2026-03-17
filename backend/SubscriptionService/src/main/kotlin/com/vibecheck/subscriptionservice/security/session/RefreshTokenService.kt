package com.vibecheck.subscriptionservice.security.session

import java.util.UUID

interface RefreshTokenService {
    fun create(userId: UUID, sessionId: UUID, ip: String?, userAgent: String?): String
    fun rotate(rawRefreshToken: String, ip: String?, userAgent: String?): RefreshRotationResult
    fun revokeByRawToken(rawRefreshToken: String)
    fun revokeBySessionId(sessionId: UUID)
}