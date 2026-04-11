package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.UserConfirmation
import com.vibecheck.userservice.domain.events.UserPreregistrationIsCreatedEvent
import com.vibecheck.userservice.usecase.generator.CodeGenerator
import com.vibecheck.userservice.usecase.storage.UserConfirmationStorage
import org.springframework.context.ApplicationEventPublisher
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.time.Clock
import java.time.Duration

@Service
class EmailUserRegistration(
    private val userConfirmationStorage: UserConfirmationStorage,
    private val passwordEncoder: PasswordEncoder,
    private val transactionTemplate: TransactionTemplate,
    private val codeGenerator: CodeGenerator,
    private val clock: Clock,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun register(email: String, password: String) {
        val confirmCode = codeGenerator.generate()

        transactionTemplate.execute {
            userConfirmationStorage.create(
                UserConfirmation.new(
                    email,
                    passwordEncoder.encode(password)!!,
                    confirmCode,
                    clock.instant() + expirationTimestamp
                )
            )

            applicationEventPublisher.publishEvent(UserPreregistrationIsCreatedEvent(email, confirmCode))
        }
    }

    private companion object {
        val expirationTimestamp = Duration.ofMinutes(5)
    }
}