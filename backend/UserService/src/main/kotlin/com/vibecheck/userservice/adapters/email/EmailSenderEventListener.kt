package com.vibecheck.userservice.adapters.email

import com.vibecheck.userservice.domain.events.NewLoginDeviceDetectedEvent
import com.vibecheck.userservice.domain.events.UserPasswordResetEvent
import com.vibecheck.userservice.domain.events.UserPreregistrationIsCreatedEvent
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service

@Service
class EmailSenderEventListener(
    private val emailSender: EmailSender
) {
    @Async
    @EventListener(UserPreregistrationIsCreatedEvent::class)
    fun onUserPreregistrationIsCreatedEvent(userPreregistrationIsCreatedEvent: UserPreregistrationIsCreatedEvent) : Unit = with(userPreregistrationIsCreatedEvent) {
        emailSender.sendRegistrationCode(email, confirmCode)
    }

    @Async
    @EventListener(UserPasswordResetEvent::class)
    fun onUserPasswordResetEvent(userPasswordResetEvent: UserPasswordResetEvent) : Unit = with(userPasswordResetEvent) {
        emailSender.sendPasswordConfirmationCode(email, confirmCode)
    }

    @Async
    @EventListener(NewLoginDeviceDetectedEvent::class)
    fun onNewLoginDeviceDetectedEvent(event: NewLoginDeviceDetectedEvent): Unit = with(event) {
        emailSender.sendNewLoginDeviceNotification(email, userAgent, ipAddress, loggedAt)
    }
}
