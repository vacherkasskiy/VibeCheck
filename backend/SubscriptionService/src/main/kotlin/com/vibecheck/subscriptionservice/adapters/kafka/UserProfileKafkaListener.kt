package com.vibecheck.subscriptionservice.adapters.kafka

import com.vibecheck.subscriptionservice.usecase.UserProfileSaving
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.support.Acknowledgment
import org.springframework.stereotype.Service
import user.profile.v1.UserEvents

@Service
class UserProfileKafkaListener(
    private val userProfileEventMapper: UserProfileEventMapper,
    private val userProfileSaving: UserProfileSaving,
) {
    @KafkaListener(
        topics = ["\${app.kafka.topics.users:users}"],
        containerFactory = "kafkaByteArrayListenerContainerFactory",
    )
    fun onUserProfileUpdated(message: ByteArray, acknowledgment: Acknowledgment) {
        val event = UserEvents.UserProfileUpdatedEvent.parseFrom(message)
        userProfileSaving.save(userProfileEventMapper.toDomain(event))
        acknowledgment.acknowledge()
    }
}
