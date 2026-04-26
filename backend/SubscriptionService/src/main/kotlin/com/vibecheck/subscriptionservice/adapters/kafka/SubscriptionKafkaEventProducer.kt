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
    private val log = LoggerFactory.getLogger(javaClass)

    fun publishUserSubscribedEvent(event: SubscriptionEvents.UserSubscribedEvent) {
        kafkaTemplate.send(topic, event.followerId, event.toByteArray()).whenComplete { result, ex ->
            if (ex != null) {
                log.error(
                    "Failed to publish subscription eventId={}, followerId={}, topic={}",
                    event.meta.eventId,
                    event.followerId,
                    topic,
                    ex
                )
            } else {
                log.info(
                    "Published subscription eventId={}, followerId={}, topic={}, partition={}, offset={}",
                    event.meta.eventId,
                    event.followerId,
                    topic,
                    result.recordMetadata.partition(),
                    result.recordMetadata.offset()
                )
            }
        }
    }
}
