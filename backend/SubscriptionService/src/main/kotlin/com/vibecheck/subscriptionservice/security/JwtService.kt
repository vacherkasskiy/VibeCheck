package com.vibecheck.subscriptionservice.security

import com.nimbusds.jose.JOSEException
import com.nimbusds.jose.JOSEObjectType
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.RSASSASigner
import com.nimbusds.jose.crypto.RSASSAVerifier
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.security.token.AccessTokenClaims
import com.vibecheck.userservice.security.token.InternalTokenClaims
import com.vibecheck.userservice.security.token.TokenType
import org.springframework.stereotype.Service
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey
import java.text.ParseException
import java.time.Instant
import java.util.Date
import java.util.UUID

@Service
class JwtService(
    private val jwtProperties: JwtProperties,
    private val privateKey: RSAPrivateKey,
    private val publicKey: RSAPublicKey
) {

    fun generateAccessToken(user: User, sessionId: UUID): String {
        val now = Instant.now()
        val expiresAt = now.plus(jwtProperties.accessTtl)
        val tokenId = UUID.randomUUID()

        val claims = JWTClaimsSet.Builder()
            .issuer(jwtProperties.issuer)
            .subject(user.id.toString())
            .audience(jwtProperties.externalAudience)
            .issueTime(Date.from(now))
            .expirationTime(Date.from(expiresAt))
            .jwtID(tokenId.toString())
            .claim("typ", TokenType.ACCESS.toString())
            .claim("sid", sessionId.toString())
            .claim("ver", user.tokenVersion)
            .build()

        return sign(claims)
    }

    fun generateInternalToken(user: User, sessionId: UUID): String {
        val now = Instant.now()
        val expiresAt = now.plus(jwtProperties.internalTtl)
        val tokenId = UUID.randomUUID()

        val claims = JWTClaimsSet.Builder()
            .issuer(jwtProperties.issuer)
            .subject(user.id.toString())
            .audience(jwtProperties.internalAudience)
            .issueTime(Date.from(now))
            .expirationTime(Date.from(expiresAt))
            .jwtID(tokenId.toString())
            .claim("typ", TokenType.INTERNAL.toString())
            .claim("sid", sessionId.toString())
            .claim("ver", user.tokenVersion)
            .claim("email", user.email)
            .claim("roles", user.roles.toString())
            .build()

        return sign(claims)
    }

    fun parseAndValidateAccessToken(token: String): AccessTokenClaims {
        val jwt = parseAndVerify(token)
        val claims = jwt.jwtClaimsSet

        validateCommonClaims(claims)
        validateAudience(claims, jwtProperties.externalAudience)
        validateTokenType(claims, TokenType.ACCESS)

        return AccessTokenClaims(
            subject = UUID.fromString(claims.subject),
            sessionId = UUID.fromString(claims.getStringClaim("sid")),
            tokenId = UUID.fromString(claims.jwtid),
            tokenVersion = claims.getLongClaim("ver"),
            issuedAt = claims.issueTime.toInstant(),
            expiresAt = claims.expirationTime.toInstant()
        )
    }

    fun parseAndValidateInternalToken(token: String): InternalTokenClaims {
        val jwt = parseAndVerify(token)
        val claims = jwt.jwtClaimsSet

        validateCommonClaims(claims)
        validateAudience(claims, jwtProperties.internalAudience)
        validateTokenType(claims, TokenType.INTERNAL)

        return InternalTokenClaims(
            subject = UUID.fromString(claims.subject),
            sessionId = UUID.fromString(claims.getStringClaim("sid")),
            tokenId = UUID.fromString(claims.jwtid),
            tokenVersion = claims.getLongClaim("ver"),
            name = claims.getStringClaim("name"),
            email = claims.getStringClaim("email"),
            roles = claims.getStringClaim("roles"),
            issuedAt = claims.issueTime.toInstant(),
            expiresAt = claims.expirationTime.toInstant()
        )
    }

    private fun sign(claims: JWTClaimsSet): String {
        return try {
            val signer = RSASSASigner(privateKey)
            val header = JWSHeader.Builder(JWSAlgorithm.RS256)
                .type(JOSEObjectType.JWT)
                .keyID(jwtProperties.keyId)
                .build()

            val signedJwt = SignedJWT(header, claims)
            signedJwt.sign(signer)
            signedJwt.serialize()
        } catch (ex: JOSEException) {
            throw IllegalStateException("Failed to sign JWT", ex)
        }
    }

    private fun parseAndVerify(token: String): SignedJWT {
        try {
            val jwt = SignedJWT.parse(token)
            val verifier = RSASSAVerifier(publicKey)

            if (!jwt.verify(verifier)) {
                throw IllegalArgumentException("Invalid JWT signature")
            }

            return jwt
        } catch (ex: ParseException) {
            throw IllegalArgumentException("Invalid JWT format", ex)
        } catch (ex: JOSEException) {
            throw IllegalArgumentException("Failed to verify JWT", ex)
        }
    }

    private fun validateCommonClaims(claims: JWTClaimsSet) {
        val now = Instant.now()

        if (claims.issuer != jwtProperties.issuer) {
            throw IllegalArgumentException("Invalid token issuer")
        }

        if (claims.subject.isNullOrBlank()) {
            throw IllegalArgumentException("Missing token subject")
        }

        if (claims.jwtid.isNullOrBlank()) {
            throw IllegalArgumentException("Missing token id")
        }

        val issuedAt = claims.issueTime?.toInstant()
            ?: throw IllegalArgumentException("Missing issuedAt")

        val expiresAt = claims.expirationTime?.toInstant()
            ?: throw IllegalArgumentException("Missing expirationTime")

        if (expiresAt.isBefore(now) || expiresAt == now) {
            throw IllegalArgumentException("Token expired")
        }

        if (issuedAt.isAfter(now.plusSeconds(30))) {
            throw IllegalArgumentException("Token issued in the future")
        }
    }

    private fun validateAudience(claims: JWTClaimsSet, expectedAudience: String) {
        val audiences = claims.audience ?: emptyList()
        if (!audiences.contains(expectedAudience)) {
            throw IllegalArgumentException("Invalid token audience")
        }
    }

    private fun validateTokenType(claims: JWTClaimsSet, expectedType: TokenType) {
        val actualType = claims.getStringClaim("typ")
        if (actualType != expectedType.toString()) {
            throw IllegalArgumentException("Invalid token type")
        }
    }
}