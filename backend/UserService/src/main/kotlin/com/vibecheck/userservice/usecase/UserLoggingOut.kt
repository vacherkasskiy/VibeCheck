package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.security.jwt.JwtParser
import com.vibecheck.userservice.usecase.cache.AccessTokenBlacklistCache
import com.vibecheck.userservice.usecase.storage.RefreshTokenStorage
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.time.Clock
import java.util.*

@Service
class UserLoggingOut(
    private val refreshTokenStorage: RefreshTokenStorage,
    private val accessTokenBlacklistCache: AccessTokenBlacklistCache,
    private val jwtParser: JwtParser,
    private val clock: Clock,
    private val transactionTemplate: TransactionTemplate,
) {
    fun logout(userId: UUID, encodedAccessToken: String) {
        val refreshTokens = refreshTokenStorage.findAllByUserId(userId)

        val revokedTokens = refreshTokens.map { it.revoke(clock.instant()) }

        transactionTemplate.execute {
            refreshTokenStorage.updateAll(revokedTokens)
        }

        val accessTokenClaims = jwtParser.parseAccessToken(encodedAccessToken)
        accessTokenBlacklistCache.put(accessTokenClaims.tokenId)
    }
}
