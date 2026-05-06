package com.vibecheck.subscriptionservice.adapters.redis

import com.vibecheck.subscriptionservice.domain.UserProfile
import com.vibecheck.subscriptionservice.usecase.cache.UserProfileCache
import org.slf4j.LoggerFactory
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
        return runCatching {
            val json = redisTemplate.opsForValue().get(key(userId))
            val profile = json?.let {
                objectMapper.readValue<UserProfile>(json)
            }
            log.info(
                "Read user profile from Redis userId={}, hit={}, keyPrefix=profiles",
                userId,
                profile != null,
            )
            profile
        }.getOrElse { error ->
            log.error("Failed to read user profile from Redis userId={}", userId, error)
            throw error
        }
    }

    override fun put(userProfile: UserProfile) {
        runCatching {
            redisTemplate.opsForValue().set(key(userProfile.userId), objectMapper.writeValueAsString(userProfile))
            log.info(
                "Saved user profile to Redis userId={}, keyPrefix=profiles",
                userProfile.userId,
            )
        }.getOrElse { error ->
            log.error("Failed to save user profile to Redis userId={}", userProfile.userId, error)
            throw error
        }
    }

    private fun key(userId: UUID): String = "profiles:$userId"

    private companion object {
        private val log = LoggerFactory.getLogger(UserProfileCacheImpl::class.java)
    }
}
