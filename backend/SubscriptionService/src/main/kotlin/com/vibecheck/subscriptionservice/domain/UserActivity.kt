package com.vibecheck.subscriptionservice.domain

import java.time.Instant
import java.util.UUID

data class UserActivity(
    val id: UUID,
    val userId: UUID,
    val activityInfo: UserInfo,
    val createdAt: Instant,
    val expiredAt: Instant,
)
