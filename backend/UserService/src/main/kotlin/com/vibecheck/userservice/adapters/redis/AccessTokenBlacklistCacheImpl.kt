package com.vibecheck.userservice.adapters.redis

import com.vibecheck.userservice.usecase.cache.AccessTokenBlacklistCache
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.Instant
import java.util.UUID

@Service
class AccessTokenBlacklistCacheImpl(
    private val redisTemplate: StringRedisTemplate
): AccessTokenBlacklistCache {
    override fun put(tokenId: String) {
        redisTemplate.opsForValue().set(buildTokenIdKey(tokenId), "revoked", TTL)
    }

    override fun put(userId: UUID) {
        redisTemplate.opsForValue().set(buildUserIdKey(userId.toString()), Instant.now().toString(), TTL)
    }

    override fun remove(userId: UUID) {
        redisTemplate.delete(buildUserIdKey(userId.toString()))
    }

    override fun isExists(tokenId: String): Boolean =
        redisTemplate.hasKey(buildTokenIdKey(tokenId))

    override fun getAddedAt(userId: UUID): Instant? =
        redisTemplate.opsForValue()
            .get(buildUserIdKey(userId.toString()))
            ?.let(Instant::parse)


    private fun buildTokenIdKey(tokenId: String): String = "blacklist:access:token:$tokenId"
    private fun buildUserIdKey(userId: String): String = "blacklist:access:user:$userId"

    companion object {
        private val TTL = Duration.ofMinutes(30)
    }
}
