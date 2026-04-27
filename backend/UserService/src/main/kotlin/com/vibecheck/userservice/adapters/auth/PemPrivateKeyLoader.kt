package com.vibecheck.userservice.adapters.auth

import com.vibecheck.userservice.domain.exception.InternalTokenException
import org.springframework.stereotype.Service
import java.nio.file.Files
import java.nio.file.Path
import java.security.KeyFactory
import java.security.interfaces.RSAPrivateKey
import java.security.spec.PKCS8EncodedKeySpec
import java.util.*

@Service
class PemPrivateKeyLoader {
    fun load(path: String): RSAPrivateKey {
        try {
            val resolvedPath = resolvePath(path)
            val pem = Files.readString(resolvedPath)
            val encoded = pem
                .lineSequence()
                .filterNot { it.startsWith("-----") }
                .joinToString(separator = "")
                .trim()

            if (encoded.isBlank()) {
                throw InternalTokenException("Internal JWT private key is empty")
            }

            val keySpec = PKCS8EncodedKeySpec(Base64.getMimeDecoder().decode(encoded))
            val privateKey = KeyFactory.getInstance("RSA").generatePrivate(keySpec)

            return privateKey as? RSAPrivateKey
                ?: throw InternalTokenException("Configured internal JWT private key is not RSA")
        } catch (exception: InternalTokenException) {
            throw exception
        } catch (exception: Exception) {
            throw InternalTokenException(
                "Failed to load internal JWT private key from '$path' (${resolveCandidates(path).joinToString()})",
                exception
            )
        }
    }

    private fun resolvePath(path: String): Path =
        resolveCandidates(path).firstOrNull(Files::exists)
            ?: throw InternalTokenException(
                "Internal JWT private key file not found for '$path' (${resolveCandidates(path).joinToString()})"
            )

    private fun resolveCandidates(path: String): List<Path> {
        val normalizedInput = path.removePrefix("./")
        val direct = Path.of(path).normalize()

        if (direct.isAbsolute) {
            return listOf(direct)
        }

        return listOf(
            direct,
            Path.of("").resolve(direct).normalize(),
            Path.of("").resolve("backend/UserService").resolve(normalizedInput).normalize()
        ).distinct()
    }
}
