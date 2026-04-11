package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.UserRole
import com.vibecheck.userservice.domain.exception.BadRequestException
import com.vibecheck.userservice.usecase.generator.TokenIssuer
import com.vibecheck.userservice.usecase.storage.UserConfirmationStorage
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.time.Clock

@Service
class EmailRegistrationConfirmation(
    private val userConfirmationStorage: UserConfirmationStorage,
    private val tokenIssuer: TokenIssuer,
    private val transactionTemplate: TransactionTemplate,
    private val clock: Clock,
    private val userCreation: UserCreation,
) {
    fun confirm(confirmCode: Int): JwtTokens {
        val userPreregistration = userConfirmationStorage.findById(confirmCode)

        if (userPreregistration.isExpired(clock.instant())) {
            transactionTemplate.execute {
                userConfirmationStorage.deleteById(confirmCode)
            }
            throw BadRequestException("User preregistration is expired")
        }

        val user = userCreation.create(userPreregistration.email, userPreregistration.password, USER_ROLES)
        return tokenIssuer.issue(user)
    }

    companion object {
        private val USER_ROLES = listOf(UserRole.USER)
    }
}