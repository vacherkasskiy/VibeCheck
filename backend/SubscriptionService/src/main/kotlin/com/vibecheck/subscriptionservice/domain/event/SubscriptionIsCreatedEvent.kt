package com.vibecheck.subscriptionservice.domain.event

import java.util.UUID

data class SubscriptionIsCreatedEvent(
    val authorId: UUID,
    val subscriberId: UUID,
) {
}