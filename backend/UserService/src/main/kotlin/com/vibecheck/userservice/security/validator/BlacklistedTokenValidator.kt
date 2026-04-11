package com.vibecheck.userservice.security.validator

import com.vibecheck.userservice.usecase.cache.AccessTokenBlacklistCache
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.OAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class BlacklistedTokenValidator(
    private val accessTokenBlacklistCache: AccessTokenBlacklistCache
) : OAuth2TokenValidator<Jwt> {

    override fun validate(token: Jwt): OAuth2TokenValidatorResult {
        val tokenId = token.id
        val userId = UUID.fromString(token.subject)

        if (tokenId.isNullOrBlank()) {
            return OAuth2TokenValidatorResult.failure(
                OAuth2Error("invalid_token", "Missing jti claim", null)
            )
        }

        return if (accessTokenBlacklistCache.isExists(userId) || accessTokenBlacklistCache.isExists(tokenId)) {
            OAuth2TokenValidatorResult.failure(
                OAuth2Error("invalid_token", "Token is revoked", null)
            )
        } else {
            OAuth2TokenValidatorResult.success()
        }
    }
}