package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.UserConfirmation
import com.vibecheck.userservice.domain.events.UserPasswordResetEvent
import com.vibecheck.userservice.security.jwt.JwtParser
import com.vibecheck.userservice.usecase.cache.AccessTokenBlacklistCache
import com.vibecheck.userservice.usecase.generator.CodeGenerator
import com.vibecheck.userservice.usecase.storage.RefreshTokenStorage
import com.vibecheck.userservice.usecase.storage.UserConfirmationStorage
import com.vibecheck.userservice.usecase.storage.UserStorage
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.time.Clock
import java.time.Duration
import java.util.UUID

@Service
class UserPasswordReset(
    private val refreshTokenStorage: RefreshTokenStorage,
    private val accessTokenBlacklistCache: AccessTokenBlacklistCache,
    private val userConfirmationStorage: UserConfirmationStorage,
    private val codeGenerator: CodeGenerator,
    private val userStorage: UserStorage,
    private val transactionTemplate: TransactionTemplate,
    private val clock: Clock,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun reset(email: String) {
        val user = userStorage.findByEmailOrThrow(email)

        val refreshTokens = refreshTokenStorage.findAllByUserId(user.id)

        val revokedTokens = refreshTokens.map { it.revoke(clock.instant()) }

        val userConfirmation = UserConfirmation.new(
            email = user.email,
            password = user.password,
            confirmCode = codeGenerator.generate(),
            expiredAt = clock.instant() + EXPIRATION_TIMESTAMP
        )

        transactionTemplate.execute {
            userConfirmationStorage.create(userConfirmation)
            refreshTokenStorage.updateAll(revokedTokens)
        }


        accessTokenBlacklistCache.put(user.id)

        applicationEventPublisher.publishEvent(UserPasswordResetEvent(
            userId = user.id,
            email = user.email,
            confirmCode = userConfirmation.confirmCode
        ))
    }

    companion object {
        private val EXPIRATION_TIMESTAMP = Duration.ofMinutes(30)
    }
}