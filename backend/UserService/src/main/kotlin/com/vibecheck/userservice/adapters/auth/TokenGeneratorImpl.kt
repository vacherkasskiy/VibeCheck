package com.vibecheck.userservice.adapters.auth

import com.vibecheck.userservice.domain.UserRole
import com.vibecheck.userservice.domain.auth.GeneratedToken
import com.vibecheck.userservice.security.jwt.JwtProperties
import com.vibecheck.userservice.security.jwt.TokenType
import com.vibecheck.userservice.usecase.generator.TokenGenerator
import com.vibecheck.userservice.utils.UuidGenerator
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.JwsHeader
import org.springframework.security.oauth2.jwt.JwtClaimsSet
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.JwtEncoderParameters
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.Instant
import java.util.*

@Service
class TokenGeneratorImpl(
    private val jwtEncoder: JwtEncoder,
    private val jwtProperties: JwtProperties,
    private val clock: Clock,
    private val uuidGenerator: UuidGenerator
): TokenGenerator {
    override fun generateAccessToken(userId: UUID, roles: List<UserRole>): GeneratedToken {
        val now = clock.instant()
        val expiresAt = now.plus(jwtProperties.accessTokenTtl)
        val tokenId = uuidGenerator.generate().toString()

        val claims = JwtClaimsSet.builder()
            .issuer(jwtProperties.issuer)
            .subject(userId.toString())
            .issuedAt(now)
            .expiresAt(expiresAt)
            .id(tokenId)
            .claim("type", TokenType.ACCESS.value)
            .claim("roles", roles.map { it.name })
            .build()

        return encode(claims, tokenId, now, expiresAt)
    }

    override fun generateRefreshToken(userId: UUID): GeneratedToken {
        val now = clock.instant()
        val expiresAt = now.plus(jwtProperties.refreshTokenTtl)
        val tokenId = uuidGenerator.generate().toString()

        val claims = JwtClaimsSet.builder()
            .issuer(jwtProperties.issuer)
            .subject(userId.toString())
            .issuedAt(now)
            .expiresAt(expiresAt)
            .id(tokenId)
            .claim("type", TokenType.REFRESH.value)
            .build()

        return encode(claims, tokenId, now, expiresAt)
    }

    private fun encode(
        claims: JwtClaimsSet,
        tokenId: String,
        issuedAt: Instant,
        expiresAt: Instant
    ): GeneratedToken {
        val jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build()
        val tokenValue = jwtEncoder.encode(
            JwtEncoderParameters.from(jwsHeader, claims)
        ).tokenValue

        return GeneratedToken(
            token = tokenValue,
            tokenId = tokenId,
            issuedAt = issuedAt,
            expiresAt = expiresAt
        )
    }
}