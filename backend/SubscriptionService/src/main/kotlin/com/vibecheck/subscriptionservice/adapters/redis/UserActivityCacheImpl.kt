package com.vibecheck.subscriptionservice.adapters.redis

import com.vibecheck.subscriptionservice.usecase.cache.UserActivityCache
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

@Repository
class UserActivityCacheImpl(
    private val redisTemplate: RedisTemplate<String, String>,
    @Value("\${app.feed.hot-size:30}")
    private val hotSize: Long,
) : UserActivityCache {
    override fun get(userIds: Collection<UUID>): Map<UUID, List<UUID>> =
        runCatching {
            val activities = userIds.associateWith { userId ->
                redisTemplate.opsForZSet()
                    .reverseRange(key(userId), 0, hotSize - 1)
                    .orEmpty()
                    .map(UUID::fromString)
            }.filterValues { it.isNotEmpty() }
            log.info(
                "Read user activity heads from Redis userIdsCount={}, hits={}, keyPrefix=userActivities",
                userIds.size,
                activities.size,
            )
            activities
        }.getOrElse { error ->
            log.error("Failed to read user activity heads from Redis userIdsCount={}", userIds.size, error)
            throw error
        }

    override fun add(userId: UUID, activityId: UUID, timestamp: Instant) {
        runCatching {
            redisTemplate.opsForZSet().add(
                key(userId),
                activityId.toString(),
                timestamp.toEpochMilli().toDouble()
            )
            trim(userId)
            log.info(
                "Saved user activity head to Redis userId={}, activityId={}, keyPrefix=userActivities",
                userId,
                activityId,
            )
        }.getOrElse { error ->
            log.error("Failed to save user activity head to Redis userId={}, activityId={}", userId, activityId, error)
            throw error
        }
    }

    private fun trim(userId: UUID) {
        val cacheKey = key(userId)
        val size = redisTemplate.opsForZSet().zCard(cacheKey) ?: return
        val itemsToRemove = size - hotSize
        if (itemsToRemove > 0) {
            redisTemplate.opsForZSet().removeRange(cacheKey, 0, itemsToRemove - 1)
        }
    }

    private fun key(userId: UUID): String = "userActivities:$userId"

    private companion object {
        private val log = LoggerFactory.getLogger(UserActivityCacheImpl::class.java)
    }
}
