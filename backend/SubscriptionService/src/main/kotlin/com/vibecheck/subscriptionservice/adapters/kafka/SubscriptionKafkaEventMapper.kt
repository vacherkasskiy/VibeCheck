package com.vibecheck.subscriptionservice.adapters.kafka

import com.google.protobuf.Timestamp
import com.vibecheck.subscriptionservice.domain.event.SubscriptionIsCreatedEvent
import common.EventMetadataOuterClass
import org.springframework.stereotype.Service
import subscriptions.SubscriptionEvents
import java.nio.charset.StandardCharsets
import java.time.Clock
import java.time.Instant
import java.util.UUID

@Service
class SubscriptionKafkaEventMapper(
    private val clock: Clock,
) {
    fun toUserSubscribedEvent(event: SubscriptionIsCreatedEvent): SubscriptionEvents.UserSubscribedEvent {
        val metadata = EventMetadataOuterClass.EventMetadata.newBuilder()
            .setEventId(UUID.randomUUID().toString())
            .setEventType("user.subscribed")
            .setAggregateId(subscriptionId(event).toString())
            .setPayloadVersion(1)
            .setOccurredAt(clock.instant().toProtoTimestamp())
            .setSource(EventMetadataOuterClass.SourceType.SUBSCRIPTION_SERVICE)
            .build()

        return SubscriptionEvents.UserSubscribedEvent.newBuilder()
            .setMeta(metadata)
            .setSubscriptionId(subscriptionId(event).toString())
            .setFollowerId(event.subscriberId.toString())
            .setTargetUserId(event.authorId.toString())
            .setCreatedAt(event.createdAt.toProtoTimestamp())
            .build()
    }

    private fun subscriptionId(event: SubscriptionIsCreatedEvent): UUID =
        UUID.nameUUIDFromBytes("${event.authorId}:${event.subscriberId}".toByteArray(StandardCharsets.UTF_8))

    private fun Instant.toProtoTimestamp(): Timestamp =
        Timestamp.newBuilder()
            .setSeconds(epochSecond)
            .setNanos(nano)
            .build()
}
