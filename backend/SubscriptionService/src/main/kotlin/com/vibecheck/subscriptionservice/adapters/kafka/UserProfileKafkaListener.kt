package com.vibecheck.subscriptionservice.adapters.kafka

import com.vibecheck.subscriptionservice.usecase.UserProfileSaving
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.support.Acknowledgment
import org.springframework.stereotype.Service
import user.profile.v1.UserEvents

@Service
class UserProfileKafkaListener(
    private val userProfileEventMapper: UserProfileEventMapper,
    private val userProfileSaving: UserProfileSaving,
    @Value("\${app.kafka.topics.users:users}")
    private val usersTopic: String,
) {
    @KafkaListener(
        topics = ["\${app.kafka.topics.users:users}"],
        containerFactory = "kafkaByteArrayListenerContainerFactory",
    )
    fun onUserProfileUpdated(message: ByteArray, acknowledgment: Acknowledgment) =
        consume(
            topic = usersTopic,
            message = message,
            acknowledgment = acknowledgment,
            parse = UserEvents.UserProfileUpdatedEvent::parseFrom,
            onReceived = { event ->
                log.info(
                    "Received user profile update eventId={}, userId={}, topic={}",
                    event.metadata.eventId,
                    event.userId,
                    usersTopic,
                )
            },
            onProcessed = { event ->
                log.info(
                    "Processed user profile update eventId={}, userId={}, topic={}",
                    event.metadata.eventId,
                    event.userId,
                    usersTopic,
                )
            },
        ) { event ->
            userProfileSaving.save(userProfileEventMapper.toDomain(event))
        }

    private inline fun <T> consume(
        topic: String,
        message: ByteArray,
        acknowledgment: Acknowledgment,
        parse: (ByteArray) -> T,
        onReceived: (T) -> Unit,
        onProcessed: (T) -> Unit,
        handle: (T) -> Unit,
    ) {
        runCatching {
            val event = parse(message)
            onReceived(event)
            handle(event)
            acknowledgment.acknowledge()
            onProcessed(event)
        }.getOrElse { error ->
            log.error("Failed to process message from topic={}", topic, error)
            throw error
        }
    }

    private companion object {
        private val log = LoggerFactory.getLogger(UserProfileKafkaListener::class.java)
    }
}
