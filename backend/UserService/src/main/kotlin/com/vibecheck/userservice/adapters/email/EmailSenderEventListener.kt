package com.vibecheck.userservice.adapters.email

import com.vibecheck.userservice.domain.events.UserPreregistrationIsCreatedEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service

@Service
class EmailSenderEventListener {
    @EventListener(UserPreregistrationIsCreatedEvent::class)
    fun onUserPreregistrationIsCreatedEvent(userPreregistrationIsCreatedEvent: UserPreregistrationIsCreatedEvent) {

    }
}