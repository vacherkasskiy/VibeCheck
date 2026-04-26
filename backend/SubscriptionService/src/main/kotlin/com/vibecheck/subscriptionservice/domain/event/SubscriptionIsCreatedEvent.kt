package com.vibecheck.subscriptionservice.domain.event

import java.time.Instant
import java.util.UUID

data class SubscriptionIsCreatedEvent(
    val authorId: UUID,
    val subscriberId: UUID,
    val createdAt: Instant,
) {
}
