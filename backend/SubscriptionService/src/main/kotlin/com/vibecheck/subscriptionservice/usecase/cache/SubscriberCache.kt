package com.vibecheck.subscriptionservice.usecase.cache

import java.util.UUID

interface SubscriberCache {
    fun get(userId: UUID): List<UUID>

    fun add(authorId: UUID, subscriberId: UUID)

    fun delete(authorId: UUID, subscriber: UUID)
}