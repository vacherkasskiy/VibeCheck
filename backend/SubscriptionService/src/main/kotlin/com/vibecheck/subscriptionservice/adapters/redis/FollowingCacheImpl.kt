package com.vibecheck.subscriptionservice.adapters.redis

import com.vibecheck.subscriptionservice.usecase.cache.FollowingCache
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class FollowingCacheImpl(
    private val redisTemplate: RedisTemplate<String, String>
) : FollowingCache {
    override fun get(userId: UUID): List<UUID> =
        redisTemplate.opsForSet().members(key(userId)).map {
            UUID.fromString(it)
        }

    override fun add(authorId: UUID, subscriberId: UUID) {
        redisTemplate.opsForSet().add(key(subscriberId), authorId.toString())
    }

    override fun delete(authorId: UUID, subscriberId: UUID) {
        redisTemplate.opsForSet().remove(key(subscriberId), authorId.toString())
    }

    private fun key(userId: UUID): String = "following:$userId"
}