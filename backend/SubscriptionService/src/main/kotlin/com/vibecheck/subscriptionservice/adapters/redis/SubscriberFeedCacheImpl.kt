package com.vibecheck.subscriptionservice.adapters.redis

import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.usecase.cache.SubscriberFeedCache
import org.slf4j.LoggerFactory
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
        runCatching {
            val activityIds = redisTemplate.opsForZSet()
                .reverseRange(key(subscriberId), 0, hotSize - 1)
                .orEmpty()
                .map(UUID::fromString)
            log.info(
                "Read subscriber feed from Redis subscriberId={}, activitiesCount={}, keyPrefix=feed",
                subscriberId,
                activityIds.size,
            )
            activityIds
        }.getOrElse { error ->
            log.error("Failed to read subscriber feed from Redis subscriberId={}", subscriberId, error)
            throw error
        }

    override fun add(subscriberId: UUID, activityId: UUID, createdAt: Instant) {
        runCatching {
            redisTemplate.opsForZSet().add(
                key(subscriberId),
                activityId.toString(),
                createdAt.toEpochMilli().toDouble()
            )
            trim(subscriberId)
            log.info(
                "Saved subscriber feed item to Redis subscriberId={}, activityId={}, keyPrefix=feed",
                subscriberId,
                activityId,
            )
        }.getOrElse { error ->
            log.error("Failed to save subscriber feed item to Redis subscriberId={}, activityId={}", subscriberId, activityId, error)
            throw error
        }
    }

    override fun addAll(subscriberId: UUID, activities: Collection<UserActivity>) {
        runCatching {
            activities.forEach { add(subscriberId, it.id, it.createdAt) }
            log.info(
                "Saved subscriber feed batch to Redis subscriberId={}, activitiesCount={}, keyPrefix=feed",
                subscriberId,
                activities.size,
            )
        }.getOrElse { error ->
            log.error("Failed to save subscriber feed batch to Redis subscriberId={}, activitiesCount={}", subscriberId, activities.size, error)
            throw error
        }
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

    private companion object {
        private val log = LoggerFactory.getLogger(SubscriberFeedCacheImpl::class.java)
    }
}
