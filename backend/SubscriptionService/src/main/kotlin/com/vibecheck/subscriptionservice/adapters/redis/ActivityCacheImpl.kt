package com.vibecheck.subscriptionservice.adapters.redis

import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.usecase.cache.ActivityCache
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

        val keys = ids.map(::key)
        val values = redisTemplate.opsForValue().multiGet(keys).orEmpty()

        return values.mapNotNull { json ->
            json?.let { objectMapper.readValue<UserActivity>(json) }
        }
    }

    override fun add(userActivity: UserActivity) {
        redisTemplate.opsForValue().set(key(userActivity.id), objectMapper.writeValueAsString(userActivity))
    }

    private fun key(activityId: UUID): String = "activities:$activityId"
}