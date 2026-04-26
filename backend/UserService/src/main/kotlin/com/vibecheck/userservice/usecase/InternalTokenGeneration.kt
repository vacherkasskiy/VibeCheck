package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.auth.GeneratedToken
import com.vibecheck.userservice.domain.exception.BadRequestException
import com.vibecheck.userservice.usecase.generator.TokenGenerator
import com.vibecheck.userservice.usecase.provider.AuthenticationProvider
import org.springframework.stereotype.Service

@Service
class InternalTokenGeneration(
    private val authenticationProvider: AuthenticationProvider,
    private val tokenGenerator: TokenGenerator,
) {
    fun generate(audiences: List<String>): GeneratedToken {
        if (audiences.isEmpty()) {
            throw BadRequestException("Internal token audiences must not be empty")
        }

        if (audiences.any { it.isBlank() }) {
            throw BadRequestException("Internal token audiences must not contain blank values")
        }

        val user = authenticationProvider.getCurrentUser()

        if (user.isBanned) {
            throw BadRequestException("Banned user ${user.id} is not allowed")
        }

        return tokenGenerator.generateInternalToken(user.id, user.roles, user.isBanned, audiences.distinct())
    }
}
