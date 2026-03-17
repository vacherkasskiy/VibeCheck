package com.vibecheck.subscriptionservice.adapters.events

import com.vibecheck.subscriptionservice.domain.event.SubscriptionIsCreatedEvent
import org.springframework.stereotype.Service
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Service
class SubscriptionEventListener {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun onSubscriptionIsCreatedEvent(event: SubscriptionIsCreatedEvent) {
        //TODO publishing to Kafka topic
    }
}