package com.vibecheck.subscriptionservice.domain.event

import java.util.UUID

data class SubscriptionIsDeletedEvent(
    val followerId: UUID,
    val subscriberId: UUID,
) {
}