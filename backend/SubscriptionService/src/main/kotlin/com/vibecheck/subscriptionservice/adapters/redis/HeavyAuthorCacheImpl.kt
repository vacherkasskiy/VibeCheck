package com.vibecheck.subscriptionservice.adapters.redis

import com.vibecheck.subscriptionservice.usecase.cache.HeavyAuthorCache
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class HeavyAuthorCacheImpl(
    private val redisTemplate: RedisTemplate<String, String>
) : HeavyAuthorCache {
    override fun isHeavy(authorId: UUID): Boolean =
        redisTemplate.opsForSet().isMember(KEY, authorId.toString())

    override fun getHeavyAuthorIds(authorIds: Collection<UUID>): Set<UUID> {
        if (authorIds.isEmpty()) {
            return emptySet()
        }

        return authorIds.filterTo(mutableSetOf()) { isHeavy(it) }
    }

    override fun getAll(): Set<UUID> =
        redisTemplate.opsForSet().members(KEY)
            .orEmpty()
            .mapTo(mutableSetOf(), UUID::fromString)

    override fun replaceAll(authorIds: Set<UUID>) {
        redisTemplate.delete(KEY)
        if (authorIds.isNotEmpty()) {
            redisTemplate.opsForSet().add(KEY, *authorIds.map(UUID::toString).toTypedArray())
        }
    }

    private companion object {
        const val KEY = "authors:heavy"
    }
}
