package com.vibecheck.userservice.security.jwt

import com.nimbusds.jose.jwk.source.ImmutableSecret
import com.vibecheck.userservice.security.validator.AccessTokenTypeValidator
import com.vibecheck.userservice.security.validator.BlacklistedTokenValidator
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.JwtValidators
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder
import javax.crypto.spec.SecretKeySpec

@Configuration
class JwtConfig(
    private val jwtProperties: JwtProperties
) {

    @Bean
    fun jwtEncoder(): JwtEncoder {
        val secretKey = SecretKeySpec(
            jwtProperties.secret.toByteArray(),
            "HmacSHA256"
        )
        return NimbusJwtEncoder(ImmutableSecret(secretKey))
    }

    @Bean
    fun accessJwtDecoder(
        accessTokenTypeValidator: AccessTokenTypeValidator,
        blacklistedTokenValidator: BlacklistedTokenValidator
    ): JwtDecoder {
        val secretKey = SecretKeySpec(
            jwtProperties.secret.toByteArray(),
            "HmacSHA256"
        )

        val decoder = NimbusJwtDecoder
            .withSecretKey(secretKey)
            .macAlgorithm(MacAlgorithm.HS256)
            .build()

        val defaultValidator = JwtValidators.createDefault()

        val validator = DelegatingOAuth2TokenValidator(
            defaultValidator,
            accessTokenTypeValidator,
            blacklistedTokenValidator
        )

        decoder.setJwtValidator(validator)
        return decoder
    }

    @Bean
    fun genericJwtDecoder(): JwtDecoder {
        val secretKey = SecretKeySpec(jwtProperties.secret.toByteArray(), "HmacSHA256")

        return NimbusJwtDecoder
            .withSecretKey(secretKey)
            .macAlgorithm(MacAlgorithm.HS256)
            .build()
    }
}