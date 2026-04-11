package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.exception.BadRequestException
import com.vibecheck.userservice.domain.auth.GeneratedToken
import com.vibecheck.userservice.security.jwt.JwtParser
import com.vibecheck.userservice.usecase.generator.TokenGenerator
import com.vibecheck.userservice.usecase.storage.RefreshTokenStorage
import org.springframework.stereotype.Service
import java.time.Clock

@Service
class TokenRefreshing(
    private val refreshTokenStorage: RefreshTokenStorage,
    private val tokenGenerator: TokenGenerator,
    private val jwtParser: JwtParser,
    private val clock: Clock,

    ) {
    fun refresh(encodedToken: String): GeneratedToken {
        val refreshTokenClaims = jwtParser.parseRefreshToken(encodedToken)

        val refreshToken = refreshTokenStorage.findById(refreshTokenClaims.tokenId)

        if (refreshToken.isExpired(clock.instant())) {
            throw BadRequestException("Token is expired")
        }

        if (refreshToken.isRevoked) {
            throw BadRequestException("Token is revoked")
        }

        val actualToken = tokenGenerator.generateRefreshToken(refreshTokenClaims.userId)

        return actualToken
    }
}