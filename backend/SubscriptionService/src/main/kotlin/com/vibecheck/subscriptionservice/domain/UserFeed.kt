package com.vibecheck.subscriptionservice.domain

import java.time.Instant
import java.util.UUID

data class UserFeed(
    val activityId: UUID,
    val profile: UserProfile,
    val feed: UserInfo,
    val createdAt: Instant,
) {
}