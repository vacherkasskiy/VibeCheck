package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.UserRole
import com.vibecheck.userservice.domain.exception.BadRequestException
import com.vibecheck.userservice.usecase.generator.TokenGenerator
import com.vibecheck.userservice.usecase.provider.AuthenticationProvider
import org.springframework.stereotype.Service

@Service
class InternalEmployeeAuthorization(
    private val authenticationProvider: AuthenticationProvider,
    private val tokenGenerator: TokenGenerator,
) {
    fun authorize(email: String, password: String, audiences: List<String>, loginContext: LoginContext): InternalEmployeeTokens {
        if (audiences.isEmpty()) {
            throw BadRequestException("Internal token audiences must not be empty")
        }

        if (audiences.any { it.isBlank() }) {
            throw BadRequestException("Internal token audiences must not contain blank values")
        }

        val user = authenticationProvider.authenticate(email, password)

        if (user.isBanned) {
            throw BadRequestException("Banned user ${user.id} is not allowed")
        }

        if (user.roles.none { it in STAFF_ROLES }) {
            throw BadRequestException("User ${user.id} is not allowed to use internal employee authorization")
        }

        val normalizedAudiences = audiences.map { it.trim() }.distinct()
        val accessToken = tokenGenerator.generateAccessToken(user.id, user.roles, user.isBanned)
        val internalToken = tokenGenerator.generateInternalToken(user.id, user.roles, user.isBanned, normalizedAudiences)

        return InternalEmployeeTokens(
            accessToken = accessToken.token,
            internalToken = internalToken.token,
        )
    }

    companion object {
        private val STAFF_ROLES = setOf(UserRole.ADMIN, UserRole.MODERATOR, UserRole.MANAGER)
    }
}

data class InternalEmployeeTokens(
    val accessToken: String,
    val internalToken: String,
)
