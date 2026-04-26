package com.vibecheck.userservice.security.validator

import com.vibecheck.userservice.security.jwt.JwtProperties
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.OAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component
import org.springframework.stereotype.Service

@Service
class AccessTokenAudienceValidator(
    private val jwtProperties: JwtProperties,
) : OAuth2TokenValidator<Jwt> {
    override fun validate(token: Jwt): OAuth2TokenValidatorResult {
        return if (token.audience.contains(jwtProperties.audience)) {
            OAuth2TokenValidatorResult.success()
        } else {
            OAuth2TokenValidatorResult.failure(
                OAuth2Error("invalid_token", "Invalid token audience", null)
            )
        }
    }
}
