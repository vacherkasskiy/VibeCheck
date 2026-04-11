package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.UserRole
import com.vibecheck.userservice.domain.exception.BadRequestException
import com.vibecheck.userservice.usecase.generator.TokenGenerator
import com.vibecheck.userservice.usecase.storage.UserConfirmationStorage
import com.vibecheck.userservice.usecase.storage.UserStorage
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.time.Clock
import java.util.UUID

@Service
class UserPasswordResetConfirmation(
    private val userConfirmationStorage: UserConfirmationStorage,
    private val userStorage: UserStorage,
    private val tokenGenerator: TokenGenerator,
    private val clock: Clock,
    private val transactionTemplate: TransactionTemplate,
) {
    fun confirm(confirmCode: Int): JwtTokens {
        val resetConfirmation = userConfirmationStorage.findById(confirmCode)

        val user = userStorage.findByEmailOrThrow(resetConfirmation.email)

        if (resetConfirmation.isExpired(clock.instant())) {
            throw BadRequestException("Password reset confirmation is expired for user with id ${user.id}")
        }

        val refreshToken = transactionTemplate.execute {
            userConfirmationStorage.deleteById(confirmCode)

            tokenGenerator.generateRefreshToken(user.id)
        }

        val accessToken = tokenGenerator.generateAccessToken(user.id, user.roles)

        return JwtTokens(accessToken = accessToken.token, refreshToken = refreshToken.token)
    }
}