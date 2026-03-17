package com.vibecheck.userservice.security.util

import org.springframework.core.io.ResourceLoader
import org.springframework.stereotype.Component
import java.security.KeyFactory
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec
import java.util.Base64

@Component
class PemKeyLoader(
    private val resourceLoader: ResourceLoader
) {

    fun loadPrivateKey(location: String): RSAPrivateKey {
        val content = resourceLoader.getResource(location)
            .inputStream
            .bufferedReader()
            .use { it.readText() }

        val normalized = content
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .replace("\\s".toRegex(), "")

        val decoded = Base64.getDecoder().decode(normalized)
        val keySpec = PKCS8EncodedKeySpec(decoded)
        val keyFactory = KeyFactory.getInstance("RSA")

        return keyFactory.generatePrivate(keySpec) as RSAPrivateKey
    }

    fun loadPublicKey(location: String): RSAPublicKey {
        val content = resourceLoader.getResource(location)
            .inputStream
            .bufferedReader()
            .use { it.readText() }

        val normalized = content
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace("\\s".toRegex(), "")

        val decoded = Base64.getDecoder().decode(normalized)
        val keySpec = X509EncodedKeySpec(decoded)
        val keyFactory = KeyFactory.getInstance("RSA")

        return keyFactory.generatePublic(keySpec) as RSAPublicKey
    }
}