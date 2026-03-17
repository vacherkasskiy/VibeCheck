package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.events.EmailRegistrationIsConfirmedEvent
import com.vibecheck.userservice.domain.exception.BadRequestException
import com.vibecheck.userservice.usecase.generator.JwtTokenGenerator
import com.vibecheck.userservice.usecase.storage.UserPreregistrationStorage
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.time.Clock

@Service
class EmailRegistrationConfirmation(
    private val userPreregistrationStorage: UserPreregistrationStorage,
    private val jwtTokenGenerator: JwtTokenGenerator,
    private val transactionTemplate: TransactionTemplate,
    private val clock: Clock,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun confirm(confirmCode: Int): JwtTokens {
        val userPreregistration = userPreregistrationStorage.findById(confirmCode)

        if (userPreregistration.isExpired(clock.instant())) {
            transactionTemplate.execute {
                userPreregistrationStorage.deleteById(confirmCode)
            }
            throw BadRequestException("User preregistration is expired")
        }

        applicationEventPublisher.publishEvent(EmailRegistrationIsConfirmedEvent(userPreregistration.email, userPreregistration.password))
        return jwtTokenGenerator.generateTokens()
    }
}