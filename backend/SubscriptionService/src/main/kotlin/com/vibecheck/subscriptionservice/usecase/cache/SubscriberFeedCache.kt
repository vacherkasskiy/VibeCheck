package com.vibecheck.subscriptionservice.usecase.cache

import com.vibecheck.subscriptionservice.domain.UserActivity
import java.time.Instant
import java.util.UUID

interface SubscriberFeedCache {
    fun get(subscriberId: UUID): List<UUID>
    fun add(subscriberId: UUID, activityId: UUID, createdAt: Instant)
    fun addAll(subscriberId: UUID, activities: Collection<UserActivity>)
}
