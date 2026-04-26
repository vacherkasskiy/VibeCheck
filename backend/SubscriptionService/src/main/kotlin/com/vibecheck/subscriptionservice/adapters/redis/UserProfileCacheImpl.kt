package com.vibecheck.subscriptionservice.adapters.redis

import com.vibecheck.subscriptionservice.domain.UserProfile
import com.vibecheck.subscriptionservice.usecase.cache.UserProfileCache
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Repository
import tools.jackson.databind.ObjectMapper
import tools.jackson.module.kotlin.readValue
import java.util.UUID

@Repository
class UserProfileCacheImpl(
    private val redisTemplate: RedisTemplate<String, String>,
    private val objectMapper: ObjectMapper
) : UserProfileCache {
    override fun get(userId: UUID): UserProfile? {
        val json = redisTemplate.opsForValue().get(key(userId))
        return json?.let {
            objectMapper.readValue<UserProfile>(json)
        }
    }

    override fun put(userProfile: UserProfile) {
        redisTemplate.opsForValue().set(key(userProfile.userId), objectMapper.writeValueAsString(userProfile))
    }

    private fun key(userId: UUID): String = "profiles:$userId"
}
