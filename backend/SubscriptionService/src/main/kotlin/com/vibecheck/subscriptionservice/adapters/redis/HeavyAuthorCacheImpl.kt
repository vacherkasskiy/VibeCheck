package com.vibecheck.subscriptionservice.adapters.redis

import com.vibecheck.subscriptionservice.usecase.cache.HeavyAuthorCache
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class HeavyAuthorCacheImpl(
    private val redisTemplate: RedisTemplate<String, String>
) : HeavyAuthorCache {
    override fun isHeavy(authorId: UUID): Boolean =
        runCatching {
            val result = redisTemplate.opsForSet().isMember(KEY, authorId.toString())
            log.info("Read heavy author flag from Redis authorId={}, isHeavy={}", authorId, result)
            result
        }.getOrElse { error ->
            log.error("Failed to read heavy author flag from Redis authorId={}", authorId, error)
            throw error
        }

    override fun getHeavyAuthorIds(authorIds: Collection<UUID>): Set<UUID> {
        if (authorIds.isEmpty()) {
            return emptySet()
        }

        return authorIds.filterTo(mutableSetOf()) { isHeavy(it) }
    }

    override fun getAll(): Set<UUID> =
        runCatching {
            val authorIds = redisTemplate.opsForSet().members(KEY)
                .orEmpty()
                .mapTo(mutableSetOf(), UUID::fromString)
            log.info("Read heavy authors from Redis authorsCount={}", authorIds.size)
            authorIds
        }.getOrElse { error ->
            log.error("Failed to read heavy authors from Redis", error)
            throw error
        }

    override fun replaceAll(authorIds: Set<UUID>) {
        runCatching {
            redisTemplate.delete(KEY)
            if (authorIds.isNotEmpty()) {
                redisTemplate.opsForSet().add(KEY, *authorIds.map(UUID::toString).toTypedArray())
            }
            log.info("Replaced heavy authors in Redis authorsCount={}", authorIds.size)
        }.getOrElse { error ->
            log.error("Failed to replace heavy authors in Redis authorsCount={}", authorIds.size, error)
            throw error
        }
    }

    private companion object {
        const val KEY = "authors:heavy"
        private val log = LoggerFactory.getLogger(HeavyAuthorCacheImpl::class.java)
    }
}
