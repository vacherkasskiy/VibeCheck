package com.vibecheck.userservice.usecase.provider

import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.domain.auth.UserLoginDevice
import com.vibecheck.userservice.domain.events.NewLoginDeviceDetectedEvent
import com.vibecheck.userservice.domain.exception.DuplicateUserLoginDeviceException
import com.vibecheck.userservice.usecase.LoginContext
import com.vibecheck.userservice.usecase.encoder.HashEncoder
import com.vibecheck.userservice.usecase.storage.UserLoginDeviceStorage
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.time.Clock

@Service
class UserLoginDeviceProvider(
    private val userLoginDeviceStorage: UserLoginDeviceStorage,
    private val hashEncoder: HashEncoder,
    private val transactionTemplate: TransactionTemplate,
    private val clock: Clock,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun registerIfNew(user: User, loginContext: LoginContext) {
        val userAgent = loginContext.userAgent
            ?.trim()
            ?.takeIf { it.isNotBlank() }
            ?: UNKNOWN_USER_AGENT
        val ipAddress = loginContext.ipAddress
            ?.trim()
            ?.takeIf { it.isNotBlank() }

        val userLoginDevice = UserLoginDevice.new(
            userId = user.id,
            fingerprint = hashEncoder.sha256(userAgent.lowercase()),
            userAgent = userAgent,
            ipAddress = ipAddress,
            createdAt = clock.instant(),
        )

        val isNewDevice = try {
            transactionTemplate.execute {
                userLoginDeviceStorage.create(userLoginDevice)
            }
            true
        } catch (_: DuplicateUserLoginDeviceException) {
            false
        }

        if (isNewDevice) {
            applicationEventPublisher.publishEvent(
                NewLoginDeviceDetectedEvent(
                    userId = user.id,
                    email = user.email,
                    userAgent = userAgent,
                    ipAddress = ipAddress,
                    loggedAt = userLoginDevice.createdAt,
                )
            )
        }
    }

    companion object {
        private const val UNKNOWN_USER_AGENT = "unknown"
    }
}