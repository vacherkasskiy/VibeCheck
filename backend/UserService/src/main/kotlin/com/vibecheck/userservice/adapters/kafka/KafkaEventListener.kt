package com.vibecheck.userservice.adapters.kafka

import com.vibecheck.userservice.domain.events.UserInfoCreatedEvent
import com.vibecheck.userservice.domain.events.UserInfoUpdatedEvent
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service

@Service
@ConditionalOnProperty(
    prefix = "user-service.kafka",
    name = ["disabled"],
    havingValue = "false",
)
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
