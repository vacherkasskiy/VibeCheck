package com.vibecheck.userservice.security.jwt

import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.security.CustomUserDetails
import com.vibecheck.userservice.usecase.storage.UserStorage
import com.vibecheck.userservice.usecase.provider.AuthenticationProvider
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AuthenticationProviderImpl(
    private val authenticationManager: AuthenticationManager,
    private val userStorage: UserStorage,
) : AuthenticationProvider {
    override fun authenticate(username: String, password: String): User {
        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(username, password)
        )

        return (authentication.principal as CustomUserDetails).user
    }

    override fun getCurrentUser(): User {
        val authentication = SecurityContextHolder.getContext().authentication

        return authentication?.toCurrentUser()
            ?: throw IllegalStateException("Missing authentication in security context")
    }

    private fun Authentication.toCurrentUser(): User {
        val principal = principal

        return when {
            principal is CustomUserDetails -> principal.user
            this is JwtAuthenticationToken -> userStorage.findById(UUID.fromString(token.subject))
            principal is Jwt -> userStorage.findById(UUID.fromString(principal.subject))
            principal is String && principal.isNotBlank() -> userStorage.findById(UUID.fromString(principal))
            else -> throw IllegalStateException("Unsupported authentication principal: ${principal?.javaClass?.name}")
        }
    }
}
