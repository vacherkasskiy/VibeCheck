package com.vibecheck.subscriptionservice.adapters.redis

import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.usecase.cache.SubscriberFeedCache
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

@Repository
class SubscriberFeedCacheImpl(
    private val redisTemplate: RedisTemplate<String, String>,
    @Value("\${app.feed.hot-size:30}")
    private val hotSize: Long,
) : SubscriberFeedCache {
    override fun get(subscriberId: UUID): List<UUID> =
        redisTemplate.opsForZSet()
            .reverseRange(key(subscriberId), 0, hotSize - 1)
            .orEmpty()
            .map(UUID::fromString)

    override fun add(subscriberId: UUID, activityId: UUID, createdAt: Instant) {
        redisTemplate.opsForZSet().add(
            key(subscriberId),
            activityId.toString(),
            createdAt.toEpochMilli().toDouble()
        )
        trim(subscriberId)
    }

    override fun addAll(subscriberId: UUID, activities: Collection<UserActivity>) {
        activities.forEach { add(subscriberId, it.id, it.createdAt) }
    }

    private fun trim(subscriberId: UUID) {
        val cacheKey = key(subscriberId)
        val size = redisTemplate.opsForZSet().zCard(cacheKey) ?: return
        val itemsToRemove = size - hotSize
        if (itemsToRemove > 0) {
            redisTemplate.opsForZSet().removeRange(cacheKey, 0, itemsToRemove - 1)
        }
    }

    private fun key(subscriberId: UUID): String = "feed:$subscriberId"
}
