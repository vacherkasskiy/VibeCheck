package com.vibecheck.userservice.adapters.email

import com.vibecheck.userservice.domain.events.UserPasswordResetEvent
import com.vibecheck.userservice.domain.events.UserPreregistrationIsCreatedEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service

@Service
class EmailSenderEventListener(
    private val emailSender: EmailSender
) {
    @EventListener(UserPreregistrationIsCreatedEvent::class)
    fun onUserPreregistrationIsCreatedEvent(userPreregistrationIsCreatedEvent: UserPreregistrationIsCreatedEvent) : Unit = with(userPreregistrationIsCreatedEvent) {
        emailSender.sendRegistrationCode(email, confirmCode)
    }

    @EventListener(UserPasswordResetEvent::class)
    fun onUserPasswordResetEvent(userPasswordResetEvent: UserPasswordResetEvent) : Unit = with(userPasswordResetEvent) {
        emailSender.sendPasswordConfirmationCode(email, confirmCode)
    }
}