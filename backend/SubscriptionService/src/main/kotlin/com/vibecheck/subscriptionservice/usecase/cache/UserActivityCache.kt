package com.vibecheck.subscriptionservice.usecase.cache

import java.time.Instant
import java.util.UUID

interface UserActivityCache {
    fun get(userIds: Collection<UUID>): Map<UUID, List<UUID>>
    fun add(userId: UUID, activityId: UUID, timestamp: Instant)
}