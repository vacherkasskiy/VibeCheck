package com.vibecheck.userservice.security.jwt

import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.security.CustomUserDetails
import com.vibecheck.userservice.usecase.provider.AuthenticationProvider
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.stereotype.Service

@Service
class AuthenticationProviderImpl(
    private val authenticationManager: AuthenticationManager,
) : AuthenticationProvider {
    override fun authenticate(username: String, password: String): User {
        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(username, password)
        )

        return (authentication.principal as CustomUserDetails).user
    }
}