package com.vibecheck.userservice.adapters.redis

import com.vibecheck.userservice.usecase.cache.AccessTokenBlacklistCache
import org.slf4j.LoggerFactory
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
        runCatching {
            redisTemplate.opsForValue().set(buildTokenIdKey(tokenId), "revoked", TTL)
            log.info("Saved blacklisted access token to Redis tokenId={}, ttlMinutes={}", tokenId, TTL.toMinutes())
        }.getOrElse { error ->
            log.error("Failed to save blacklisted access token to Redis tokenId={}", tokenId, error)
            throw error
        }
    }

    override fun put(userId: UUID) {
        runCatching {
            redisTemplate.opsForValue().set(buildUserIdKey(userId.toString()), Instant.now().toString(), TTL)
            log.info("Saved blacklist marker to Redis userId={}, ttlMinutes={}", userId, TTL.toMinutes())
        }.getOrElse { error ->
            log.error("Failed to save blacklist marker to Redis userId={}", userId, error)
            throw error
        }
    }

    override fun remove(userId: UUID) {
        runCatching {
            redisTemplate.delete(buildUserIdKey(userId.toString()))
            log.info("Deleted blacklist marker from Redis userId={}", userId)
        }.getOrElse { error ->
            log.error("Failed to delete blacklist marker from Redis userId={}", userId, error)
            throw error
        }
    }

    override fun isExists(tokenId: String): Boolean =
        runCatching {
            val exists = redisTemplate.hasKey(buildTokenIdKey(tokenId))
            log.info("Read blacklisted access token from Redis tokenId={}, exists={}", tokenId, exists)
            exists
        }.getOrElse { error ->
            log.error("Failed to read blacklisted access token from Redis tokenId={}", tokenId, error)
            throw error
        }

    override fun getAddedAt(userId: UUID): Instant? =
        runCatching {
            val addedAt = redisTemplate.opsForValue()
                .get(buildUserIdKey(userId.toString()))
                ?.let(Instant::parse)
            log.info("Read blacklist marker from Redis userId={}, hit={}", userId, addedAt != null)
            addedAt
        }.getOrElse { error ->
            log.error("Failed to read blacklist marker from Redis userId={}", userId, error)
            throw error
        }


    private fun buildTokenIdKey(tokenId: String): String = "blacklist:access:token:$tokenId"
    private fun buildUserIdKey(userId: String): String = "blacklist:access:user:$userId"

    companion object {
        private val TTL = Duration.ofMinutes(30)
        private val log = LoggerFactory.getLogger(AccessTokenBlacklistCacheImpl::class.java)
    }
}
