package com.vibecheck.subscriptionservice.adapters.rest.dto

import com.vibecheck.subscriptionservice.domain.SubscriptionStatus
import java.util.UUID

data class SubscriptionStatusDto(
    val followeeId: UUID,
    val subscriberId: UUID,
    val status: SubscriptionStatus
)

fun SubscriptionStatus.toDto(followeeId: UUID, subscriberId: UUID): SubscriptionStatusDto =
    SubscriptionStatusDto(followeeId, subscriberId, this)
