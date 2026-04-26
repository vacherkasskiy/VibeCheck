package com.vibecheck.userservice.usecase.encoder

import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.security.MessageDigest

@Service
class HashEncoder {
    fun sha256(input: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hashBytes = digest.digest(input.toByteArray(StandardCharsets.UTF_8))
        return hashBytes.joinToString("") { "%02x".format(it) }
    }
}