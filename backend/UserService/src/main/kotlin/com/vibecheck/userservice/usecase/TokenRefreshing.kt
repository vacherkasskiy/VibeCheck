package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.exception.BadRequestException
import com.vibecheck.userservice.security.jwt.JwtParser
import com.vibecheck.userservice.usecase.encoder.HashEncoder
import com.vibecheck.userservice.usecase.generator.TokenIssuer
import com.vibecheck.userservice.usecase.storage.RefreshTokenStorage
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.time.Clock

@Service
class TokenRefreshing(
    private val refreshTokenStorage: RefreshTokenStorage,
    private val jwtParser: JwtParser,
    private val hashEncoder: HashEncoder,
    private val tokenIssuer: TokenIssuer,
    private val clock: Clock,
    private val transactionTemplate: TransactionTemplate,
    ) {
    fun refresh(encodedToken: String): JwtTokens {
        val refreshTokenClaims = jwtParser.parseRefreshToken(encodedToken)

        val refreshToken = refreshTokenStorage.findById(refreshTokenClaims.tokenId)

        if (refreshToken.isExpired(clock.instant())) {
            throw BadRequestException("Token is expired")
        }

        if (refreshToken.isRevoked) {
            throw BadRequestException("Token is revoked")
        }

        if (refreshToken.tokenHash != hashEncoder.sha256(encodedToken)) {
            throw BadRequestException("Token is invalid")
        }

        transactionTemplate.execute {
            refreshTokenStorage.updateAll(listOf(refreshToken.revoke(clock.instant())))
        }

        return tokenIssuer.issue(refreshToken.user)
    }
}
