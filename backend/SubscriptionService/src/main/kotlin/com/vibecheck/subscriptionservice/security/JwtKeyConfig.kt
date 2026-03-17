package com.vibecheck.subscriptionservice.security

import com.vibecheck.userservice.security.util.PemKeyLoader
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey

@Configuration
@EnableConfigurationProperties
class JwtKeyConfig(
    private val jwtProperties: JwtProperties,
    private val pemKeyLoader: PemKeyLoader
) {

    @Bean
    fun rsaPrivateKey(): RSAPrivateKey =
        pemKeyLoader.loadPrivateKey(jwtProperties.privateKeyPath)

    @Bean
    fun rsaPublicKey(): RSAPublicKey =
        pemKeyLoader.loadPublicKey(jwtProperties.publicKeyPath)
}