package com.vibecheck.userservice.domain.auth

import com.vibecheck.userservice.domain.User
import java.time.Duration
import java.time.Instant

data class RefreshToken(
    val tokenId: String,
    val version: Int,
    val user: User,
    val tokenHash: String,
    val issuedAt: Instant,
    val expiredAt: Instant,
    val revokedAt: Instant?,
    val createdAt: Instant
) {
    val isRevoked: Boolean = revokedAt != null

    fun isExpired(now: Instant): Boolean = expiredAt <= now

    fun revoke(instant: Instant): RefreshToken = copy(revokedAt = instant)

    companion object {
        private val EXPIRATION_TIME = Duration.ofDays(5)

        fun new(
            tokenId: String,
            user: User,
            tokenHash: String,
            now: Instant,
        ): RefreshToken =
            RefreshToken(
                tokenId = tokenId,
                version = 0,
                user = user,
                tokenHash = tokenHash,
                issuedAt = now,
                expiredAt = now  + EXPIRATION_TIME,
                revokedAt = null,
                createdAt = now
            )
    }
}
