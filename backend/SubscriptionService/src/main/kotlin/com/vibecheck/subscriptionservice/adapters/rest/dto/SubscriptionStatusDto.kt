package com.vibecheck.subscriptionservice.adapters.rest.dto

import com.vibecheck.subscriptionservice.domain.SubscriptionStatus
import java.util.UUID

data class SubscriptionStatusDto(
    val authorId: UUID,
    val subscriberId: UUID,
    val status: SubscriptionStatus
)

fun SubscriptionStatus.toDto(authorId: UUID, subscriberId: UUID): SubscriptionStatusDto =
    SubscriptionStatusDto(authorId = authorId, subscriberId = subscriberId, status = this)
