package com.vibecheck.userservice.adapters.kafka

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Service
import user.profile.v1.UserEvents

@Service
class KafkaEventProducer(
    private val kafkaTemplate: KafkaTemplate<String, ByteArray>,
    @Value("\${user-service.kafka.topic.users}")
    private val topic: String
) {
    private val log = LoggerFactory.getLogger(javaClass)

    fun publishUserProfileUpdatedEvent(event: UserEvents.UserProfileUpdatedEvent) {
        val key = event.userId
        val payload = event.toByteArray()

        kafkaTemplate.send(topic, key, payload).whenComplete { result, ex ->
            if (ex != null) {
                log.error(
                    "Failed to publish eventId={}, userId={}, topic={}",
                    event.metadata.eventId,
                    event.userId,
                    topic,
                    ex
                )
            } else {
                log.info(
                    "Published eventId={}, userId={}, topic={}, partition={}, offset={}",
                    event.metadata.eventId,
                    event.userId,
                    topic,
                    result.recordMetadata.partition(),
                    result.recordMetadata.offset()
                )
            }
        }
    }
}