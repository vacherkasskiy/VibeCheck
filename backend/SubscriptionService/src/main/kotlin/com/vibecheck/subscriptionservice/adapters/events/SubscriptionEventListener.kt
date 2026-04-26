package com.vibecheck.subscriptionservice.adapters.events

import com.vibecheck.subscriptionservice.adapters.kafka.SubscriptionKafkaEventMapper
import com.vibecheck.subscriptionservice.adapters.kafka.SubscriptionKafkaEventProducer
import com.vibecheck.subscriptionservice.domain.event.SubscriptionIsCreatedEvent
import org.springframework.stereotype.Service
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Service
class SubscriptionEventListener(
    private val subscriptionKafkaEventMapper: SubscriptionKafkaEventMapper,
    private val subscriptionKafkaEventProducer: SubscriptionKafkaEventProducer,
) {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun onSubscriptionIsCreatedEvent(event: SubscriptionIsCreatedEvent) {
        subscriptionKafkaEventProducer.publishUserSubscribedEvent(
            subscriptionKafkaEventMapper.toUserSubscribedEvent(event)
        )
    }
}
