package com.vibecheck.subscriptionservice.adapters.kafka

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Service
import subscriptions.SubscriptionEvents

@Service
class SubscriptionKafkaEventProducer(
    private val kafkaTemplate: KafkaTemplate<String, ByteArray>,
    @Value("\${app.kafka.topics.subscriptions:subscriptions}")
    private val topic: String,
) {
    fun publishUserSubscribedEvent(event: SubscriptionEvents.UserSubscribedEvent) {
        log.info(
            "Publishing subscription eventId={}, followerId={}, targetUserId={}, topic={}",
            event.meta.eventId,
            event.followerId,
            event.targetUserId,
            topic,
        )

        kafkaTemplate.send(topic, event.followerId, event.toByteArray()).whenComplete { result, ex ->
            if (ex != null) {
                log.error(
                    "Failed to publish subscription eventId={}, followerId={}, targetUserId={}, topic={}",
                    event.meta.eventId,
                    event.followerId,
                    event.targetUserId,
                    topic,
                    ex
                )
            } else {
                log.info(
                    "Published subscription eventId={}, followerId={}, targetUserId={}, topic={}, partition={}, offset={}",
                    event.meta.eventId,
                    event.followerId,
                    event.targetUserId,
                    topic,
                    result.recordMetadata.partition(),
                    result.recordMetadata.offset()
                )
            }
        }
    }

    private companion object {
        private val log = LoggerFactory.getLogger(SubscriptionKafkaEventProducer::class.java)
    }
}
