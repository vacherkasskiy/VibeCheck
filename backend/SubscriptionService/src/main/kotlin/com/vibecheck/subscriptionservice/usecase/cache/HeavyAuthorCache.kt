package com.vibecheck.subscriptionservice.usecase.cache

import java.util.UUID

interface HeavyAuthorCache {
    fun isHeavy(authorId: UUID): Boolean
    fun getHeavyAuthorIds(authorIds: Collection<UUID>): Set<UUID>
    fun getAll(): Set<UUID>
    fun replaceAll(authorIds: Set<UUID>)
}
