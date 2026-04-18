package com.vibecheck.userservice.adapters.auth

import com.nimbusds.jose.JOSEException
import com.nimbusds.jose.JOSEObjectType
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.RSASSASigner
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import com.vibecheck.userservice.domain.UserRole
import com.vibecheck.userservice.domain.auth.GeneratedToken
import com.vibecheck.userservice.domain.exception.InternalTokenException
import com.vibecheck.userservice.security.jwt.InternalJwtProperties
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
    private val uuidGenerator: UuidGenerator,
    private val internalJwtProperties: InternalJwtProperties,
    private val pemPrivateKeyLoader: PemPrivateKeyLoader
): TokenGenerator {
    override fun generateAccessToken(userId: UUID, roles: List<UserRole>, isBanned: Boolean): GeneratedToken {
        val now = clock.instant()
        val expiresAt = now.plus(jwtProperties.accessTokenTtl)
        val tokenId = uuidGenerator.generate().toString()

        val claims = JwtClaimsSet.builder()
            .issuer(jwtProperties.issuer)
            .subject(userId.toString())
            .audience(listOf(jwtProperties.audience))
            .issuedAt(now)
            .expiresAt(expiresAt)
            .id(tokenId)
            .claim("type", TokenType.ACCESS.value)
            .claim("roles", roles.map { it.name })
            .claim("is_banned", isBanned)
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

    override fun generateInternalToken(
        userId: UUID,
        roles: List<UserRole>,
        isBanned: Boolean,
        audiences: List<String>,
    ): GeneratedToken {
        val issuedAt = clock.instant()
        val expiresAt = issuedAt.plus(internalJwtProperties.ttl)
        val privateKey = pemPrivateKeyLoader.load(internalJwtProperties.privateKeyPath)

        val header = JWSHeader.Builder(JWSAlgorithm.RS256)
            .type(JOSEObjectType.JWT)
            .keyID(internalJwtProperties.kid)
            .build()

        val jid = uuidGenerator.generate().toString()

        val claims = JWTClaimsSet.Builder()
            .issuer(internalJwtProperties.issuer)
            .subject(userId.toString())
            .audience(audiences)
            .issueTime(Date.from(issuedAt))
            .expirationTime(Date.from(expiresAt))
            .jwtID(jid)
            .claim("roles", roles.map { it.name })
            .claim("is_banned", isBanned)
            .build()

        val jwt = SignedJWT(header, claims)

        try {
            jwt.sign(RSASSASigner(privateKey))
            return GeneratedToken(token = jwt.serialize(), tokenId = jid, issuedAt = issuedAt, expiresAt = expiresAt)
        } catch (exception: JOSEException) {
            throw InternalTokenException("Failed to sign internal JWT", exception)
        }
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
