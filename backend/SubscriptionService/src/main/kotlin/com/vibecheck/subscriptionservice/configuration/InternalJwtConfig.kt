package com.vibecheck.subscriptionservice.configuration

import com.vibecheck.subscriptionservice.domain.UserRole
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.OAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtValidators
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import java.nio.file.Files
import java.nio.file.Path
import java.security.KeyFactory
import java.security.interfaces.RSAPublicKey
import java.security.spec.X509EncodedKeySpec
import java.util.Base64
import java.util.UUID

@Configuration
@EnableConfigurationProperties(InternalJwtProperties::class)
class InternalJwtConfig(
    private val internalJwtProperties: InternalJwtProperties,
) {

    @Bean
    fun internalJwtDecoder(): JwtDecoder {
        val decoder = NimbusJwtDecoder.withPublicKey(loadPublicKey(internalJwtProperties.publicKeyPath))
            .build()

        val validator = DelegatingOAuth2TokenValidator(
            JwtValidators.createDefaultWithIssuer(internalJwtProperties.issuer),
            audienceValidator(internalJwtProperties.audience),
            subjectValidator(),
            tokenIdValidator(),
            issuedAtValidator(),
            expirationValidator(),
            keyIdValidator(internalJwtProperties.kid),
            requiredRoleValidator(UserRole.USER),
            notBannedValidator(),
        )

        decoder.setJwtValidator(validator)
        return decoder
    }

    private fun audienceValidator(expectedAudience: String): OAuth2TokenValidator<Jwt> =
        OAuth2TokenValidator { token ->
            if (token.audience.contains(expectedAudience)) {
                OAuth2TokenValidatorResult.success()
            } else {
                OAuth2TokenValidatorResult.failure(
                    OAuth2Error("invalid_token", "Invalid internal token audience", null)
                )
            }
        }

    private fun subjectValidator(): OAuth2TokenValidator<Jwt> =
        OAuth2TokenValidator { token ->
            val subject = token.subject

            if (subject.isNullOrBlank()) {
                return@OAuth2TokenValidator failure("Missing subject claim")
            }

            runCatching { UUID.fromString(subject) }
                .fold(
                    onSuccess = { OAuth2TokenValidatorResult.success() },
                    onFailure = { failure("Subject claim must be a UUID") }
                )
        }

    private fun tokenIdValidator(): OAuth2TokenValidator<Jwt> =
        OAuth2TokenValidator { token ->
            if (token.id.isNullOrBlank()) failure("Missing jti claim")
            else OAuth2TokenValidatorResult.success()
        }

    private fun issuedAtValidator(): OAuth2TokenValidator<Jwt> =
        OAuth2TokenValidator { token ->
            if (token.issuedAt == null) failure("Missing iat claim")
            else OAuth2TokenValidatorResult.success()
        }

    private fun expirationValidator(): OAuth2TokenValidator<Jwt> =
        OAuth2TokenValidator { token ->
            if (token.expiresAt == null) failure("Missing exp claim")
            else OAuth2TokenValidatorResult.success()
        }

    private fun keyIdValidator(expectedKid: String): OAuth2TokenValidator<Jwt> =
        OAuth2TokenValidator { token ->
            val actualKid = token.headers["kid"]?.toString()
            if (actualKid == expectedKid) OAuth2TokenValidatorResult.success()
            else failure("Invalid key id")
        }

    private fun requiredRoleValidator(requiredRole: UserRole): OAuth2TokenValidator<Jwt> =
        OAuth2TokenValidator { token ->
            val roles = token.getClaimAsStringList("roles").orEmpty()
            if (roles.contains(requiredRole.name)) OAuth2TokenValidatorResult.success()
            else failure("User must have role ${requiredRole.name}")
        }

    private fun notBannedValidator(): OAuth2TokenValidator<Jwt> =
        OAuth2TokenValidator { token ->
            when (token.claims["is_banned"]) {
                false -> OAuth2TokenValidatorResult.success()
                true -> failure("Banned user is not allowed")
                else -> failure("Missing or invalid is_banned claim")
            }
        }

    private fun failure(message: String): OAuth2TokenValidatorResult =
        OAuth2TokenValidatorResult.failure(
            OAuth2Error("invalid_token", message, null)
        )

    private fun loadPublicKey(path: String): RSAPublicKey {
        val pem = Files.readString(Path.of(path))
        val normalized = pem
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace("\\s".toRegex(), "")

        val keyBytes = Base64.getDecoder().decode(normalized)
        val keySpec = X509EncodedKeySpec(keyBytes)
        val keyFactory = KeyFactory.getInstance("RSA")

        return keyFactory.generatePublic(keySpec) as RSAPublicKey
    }
}
