package com.vibecheck.userservice.adapters.events

import com.vibecheck.userservice.domain.UserRole
import com.vibecheck.userservice.domain.events.EmailRegistrationIsConfirmedEvent
import com.vibecheck.userservice.usecase.UserCreation
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service

@Service
class ApiEventListener(
    private val userCreation: UserCreation
) {
    @EventListener(EmailRegistrationIsConfirmedEvent::class)
    fun onEmailRegistrationIsConfirmed(event: EmailRegistrationIsConfirmedEvent): Unit = with(event) {
        userCreation.create(email, password, listOf(UserRole.USER))
    }
}