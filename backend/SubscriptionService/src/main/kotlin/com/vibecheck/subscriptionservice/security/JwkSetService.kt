package com.vibecheck.subscriptionservice.security

import com.nimbusds.jose.jwk.JWKSet
import com.nimbusds.jose.jwk.KeyUse
import com.nimbusds.jose.jwk.RSAKey
import org.springframework.stereotype.Service
import java.security.interfaces.RSAPublicKey

@Service
class JwkSetService(
    private val jwtProperties: JwtProperties,
    private val publicKey: RSAPublicKey
) {

    fun getJwkSet(): Map<String, Any> {
        val jwk = RSAKey.Builder(publicKey)
            .keyUse(KeyUse.SIGNATURE)
            .keyID(jwtProperties.keyId)
            .build()

        return JWKSet(jwk).toJSONObject()
    }
}