package com.vibecheck.subscriptionservice.usecase.cache

import java.util.UUID

interface FollowingCache {
    fun get(userId: UUID): List<UUID>

    fun add(authorId: UUID, subscriberId: UUID)

    fun delete(authorId: UUID, subscriberId: UUID)
}