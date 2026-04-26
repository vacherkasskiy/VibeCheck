package com.vibecheck.subscriptionservice.domain

import java.time.Instant
import java.util.UUID

data class Subscription(
    val authorId: UUID,
    val subscriberId: UUID,
    val createdAt: Instant
)