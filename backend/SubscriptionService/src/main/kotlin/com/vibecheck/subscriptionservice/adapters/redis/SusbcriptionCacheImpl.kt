package com.vibecheck.subscriptionservice.adapters.redis

import com.vibecheck.subscriptionservice.usecase.cache.SusbcriptionCache
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class SusbcriptionCacheImpl(
    private val redisTemplate: RedisTemplate<String, String>
) : SusbcriptionCache {
    override fun get(userId: UUID): List<UUID> =
        runCatching {
            val authorIds = redisTemplate.opsForSet().members(key(userId)).map(UUID::fromString)
            log.info(
                "Read following from Redis subscriberId={}, authorsCount={}, keyPrefix=following",
                userId,
                authorIds.size,
            )
            authorIds
        }.getOrElse { error ->
            log.error("Failed to read following from Redis subscriberId={}", userId, error)
            throw error
        }

    override fun add(subscriberId: UUID, authorId: UUID) {
        runCatching {
            redisTemplate.opsForSet().add(key(subscriberId), authorId.toString())
            log.info(
                "Saved following to Redis subscriberId={}, authorId={}, keyPrefix=following",
                subscriberId,
                authorId,
            )
        }.getOrElse { error ->
            log.error("Failed to save following to Redis subscriberId={}, authorId={}", subscriberId, authorId, error)
            throw error
        }
    }

    override fun delete(subscriberId: UUID, authorId: UUID) {
        runCatching {
            redisTemplate.opsForSet().remove(key(subscriberId), authorId.toString())
            log.info(
                "Deleted following from Redis subscriberId={}, authorId={}, keyPrefix=following",
                subscriberId,
                authorId,
            )
        }.getOrElse { error ->
            log.error("Failed to delete following from Redis subscriberId={}, authorId={}", subscriberId, authorId, error)
            throw error
        }
    }

    private fun key(userId: UUID): String = "following:$userId"

    private companion object {
        private val log = LoggerFactory.getLogger(SusbcriptionCacheImpl::class.java)
    }
}
