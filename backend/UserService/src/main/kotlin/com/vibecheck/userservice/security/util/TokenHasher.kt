package com.vibecheck.userservice.security.util

import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.security.MessageDigest

@Component
class TokenHasher {

    fun hash(token: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hashBytes = digest.digest(token.toByteArray(StandardCharsets.UTF_8))

        return hashBytes.joinToString("") { "%02x".format(it) }
    }
}