package com.vibecheck.userservice.adapters.kafka

import com.vibecheck.userservice.domain.events.UserInfoCreatedEvent
import com.vibecheck.userservice.domain.events.UserInfoUpdatedEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service

@Service
class KafkaEventListener(
    private val producer: KafkaEventProducer,
    private val userProfileEventMapper: UserProfileEventMapper,
) {
    @EventListener(UserInfoCreatedEvent::class)
    fun onUserCreated(event: UserInfoCreatedEvent) {
        val protoEvent = userProfileEventMapper.toEvent(event.userProfile)
        producer.publishUserProfileUpdatedEvent(protoEvent)
    }

    @EventListener(UserInfoUpdatedEvent::class)
    fun onUserUpdated(event: UserInfoUpdatedEvent) {
        val protoEvent = userProfileEventMapper.toEvent(event.userProfile)
        producer.publishUserProfileUpdatedEvent(protoEvent)
    }
}