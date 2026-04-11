package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.usecase.generator.TokenIssuer
import com.vibecheck.userservice.usecase.provider.AuthenticationProvider
import org.springframework.stereotype.Service

@Service
class EmailUserAuthorization(
    private val authenticationProvider: AuthenticationProvider,
    private val tokenIssuer: TokenIssuer,
) {
    fun authorize(email: String, password: String): JwtTokens {
        val user = authenticationProvider.authenticate(email, password)

        return tokenIssuer.issue(user)
    }
}
