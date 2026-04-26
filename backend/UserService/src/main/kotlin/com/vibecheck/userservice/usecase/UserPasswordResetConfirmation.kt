package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.exception.BadRequestException
import com.vibecheck.userservice.usecase.generator.TokenIssuer
import com.vibecheck.userservice.usecase.storage.UserConfirmationStorage
import com.vibecheck.userservice.usecase.storage.UserStorage
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.time.Clock

@Service
class UserPasswordResetConfirmation(
    private val userConfirmationStorage: UserConfirmationStorage,
    private val userStorage: UserStorage,
    private val tokenIssuer: TokenIssuer,
    private val clock: Clock,
    private val transactionTemplate: TransactionTemplate,
) {
    fun confirm(confirmCode: Int): JwtTokens {
        val resetConfirmation = userConfirmationStorage.findById(confirmCode)

        if (resetConfirmation.isExpired(clock.instant())) {
            throw BadRequestException("Password reset confirmation $confirmCode is expired")
        }

        val user = userStorage.findByEmailOrThrow(resetConfirmation.email)

        val updatedUser = user.resetPassword(resetConfirmation.password)

        transactionTemplate.execute {
            userStorage.update(updatedUser)

            userConfirmationStorage.deleteById(confirmCode)
        }

        return tokenIssuer.issue(updatedUser)
    }
}
