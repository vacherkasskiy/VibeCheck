package com.vibecheck.subscriptionservice.domain.event

import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.domain.UserInfo
import java.time.Instant
import java.util.UUID

data class UserActivityIsCreatedEvent(
    val userId: UUID,
    val activityInfo: UserInfo,
    val expiredAt: Instant,
) {
}