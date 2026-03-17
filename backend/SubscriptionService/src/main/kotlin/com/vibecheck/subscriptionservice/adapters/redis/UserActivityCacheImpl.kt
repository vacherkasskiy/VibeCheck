package com.vibecheck.subscriptionservice.adapters.redis

import com.vibecheck.subscriptionservice.usecase.cache.UserActivityCache
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

@Repository
class UserActivityCacheImpl(
    private val redisTemplate: RedisTemplate<String, String>
) : UserActivityCache {
    override fun get(userIds: Collection<UUID>): Map<UUID, List<UUID>> {
        TODO("Not yet implemented")
    }

    override fun add(userId: UUID, activityId: UUID, timestamp: Instant) {
        TODO("Not yet implemented")
    }

    private fun key(userId: UUID): String = "userActivities:$userId"
}