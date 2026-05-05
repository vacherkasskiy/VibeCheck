package com.vibecheck.subscriptionservice.adapters.redis

import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.usecase.cache.ActivityCache
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Repository
import tools.jackson.databind.ObjectMapper
import tools.jackson.module.kotlin.readValue
import java.util.UUID

@Repository
class ActivityCacheImpl(
    private val redisTemplate: RedisTemplate<String, String>,
    private val objectMapper: ObjectMapper
) : ActivityCache {
    override fun get(ids: Collection<UUID>): List<UserActivity> {
        if (ids.isEmpty()) return emptyList()

        return runCatching {
            val keys = ids.map(::key)
            val values = redisTemplate.opsForValue().multiGet(keys).orEmpty()
            val activities = values.mapNotNull { json ->
                json?.let(::readCachedActivity)
            }
            log.info(
                "Read activities from Redis idsCount={}, hits={}, keyPrefix=activities",
                ids.size,
                activities.size,
            )
            activities
        }.getOrElse { error ->
            log.error("Failed to read activities from Redis idsCount={}", ids.size, error)
            throw error
        }
    }

    override fun add(userActivity: UserActivity) {
        runCatching {
            redisTemplate.opsForValue().set(key(userActivity.id), objectMapper.writeValueAsString(userActivity.toCacheDto()))
            log.info(
                "Saved activity to Redis activityId={}, userId={}, keyPrefix=activities",
                userActivity.id,
                userActivity.userId,
            )
        }.getOrElse { error ->
            log.error("Failed to save activity to Redis activityId={}, userId={}", userActivity.id, userActivity.userId, error)
            throw error
        }
    }

    private fun readCachedActivity(json: String): UserActivity? =
        runCatching {
            objectMapper.readValue<ActivityCacheDto>(json).toDomain()
        }.getOrElse { error ->
            log.warn("Failed to deserialize cached activity, skipping stale value", error)
            null
        }

    private fun key(activityId: UUID): String = "activities:$activityId"

    private companion object {
        private val log = LoggerFactory.getLogger(ActivityCacheImpl::class.java)
    }
}
