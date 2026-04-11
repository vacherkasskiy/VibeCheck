package com.vibecheck.userservice.security.jwt

import com.vibecheck.userservice.domain.UserRole
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.security.oauth2.jwt.BadJwtException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class JwtParser(
    @Qualifier("genericJwtDecoder")
    private val genericJwtDecoder: JwtDecoder,
) {
    fun parseAccessToken(token: String): AccessTokenClaims {
        val jwt = decodeAndValidateAccessToken(token)
        return AccessTokenClaims(
            tokenId = extractTokenId(jwt),
            userId = extractUserId(jwt),
            roles = extractRoles(jwt),
            expiresAt = jwt.expiresAt ?: throw BadJwtException("Missing exp claim")
        )
    }

    fun parseRefreshToken(token: String): RefreshTokenClaims {
        val jwt = decodeAndValidateRefreshToken(token)
        return RefreshTokenClaims(
            tokenId = extractTokenId(jwt),
            userId = extractUserId(jwt),
            expiresAt = jwt.expiresAt ?: throw BadJwtException("Missing exp claim")
        )
    }


    fun decodeAndValidateAccessToken(token: String): Jwt {
        val jwt = decode(token)
        validateRequiredClaims(jwt)
        if (jwt.getClaimAsString("type") != TokenType.ACCESS.value) {
            throw BadJwtException("Invalid token type: expected access")
        }
        return jwt
    }

    fun decodeAndValidateRefreshToken(token: String): Jwt {
        val jwt = decode(token)
        validateRequiredClaims(jwt)
        if (jwt.getClaimAsString("type") != TokenType.REFRESH.value) {
            throw BadJwtException("Invalid token type: expected refresh")
        }
        return jwt
    }

    fun extractTokenId(jwt: Jwt): String {
        return jwt.id ?: throw BadJwtException("Missing jti claim")
    }

    fun extractUserId(jwt: Jwt): UUID {
        val subject = jwt.subject ?: throw BadJwtException("Missing sub claim")
        return UUID.fromString(subject) ?: throw BadJwtException("Invalid sub claim")
    }

    fun extractRoles(jwt: Jwt): List<UserRole> {
        return jwt.getClaimAsStringList("roles")?.map { UserRole.valueOf(it) } ?: emptyList()
    }

    fun decode(token: String): Jwt {
        return genericJwtDecoder.decode(token)
    }

    private fun validateRequiredClaims(jwt: Jwt) {
        if (jwt.id.isNullOrBlank()) {
            throw BadJwtException("Missing jti claim")
        }
        if (jwt.subject.isNullOrBlank()) {
            throw BadJwtException("Missing sub claim")
        }
        if (jwt.getClaimAsString("type").isNullOrBlank()) {
            throw BadJwtException("Missing type claim")
        }
    }
}