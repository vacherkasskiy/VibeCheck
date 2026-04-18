package com.vibecheck.userservice.usecase.generator

import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.domain.auth.RefreshToken
import com.vibecheck.userservice.usecase.JwtTokens
import com.vibecheck.userservice.usecase.storage.RefreshTokenStorage
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.time.Clock

@Service
class TokenIssuer(
    private val tokenGenerator: TokenGenerator,
    private val refreshTokenStorage: RefreshTokenStorage,
    private val transactionTemplate: TransactionTemplate,
    private val clock: Clock
) {
    fun issue(user: User): JwtTokens {
        val accessToken = tokenGenerator.generateAccessToken(user.id, user.roles, user.isBanned)
        val refreshToken = tokenGenerator.generateRefreshToken(user.id)

        transactionTemplate.execute {
            refreshTokenStorage.create(
                RefreshToken.new(
                    tokenId = refreshToken.tokenId,
                    user = user,
                    tokenHash = refreshToken.token,
                    now = clock.instant()
                )
            )
        }

        return JwtTokens(
            accessToken = accessToken.token,
            refreshToken = refreshToken.token
        )
    }
}
