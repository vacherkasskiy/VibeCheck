package com.vibecheck.subscriptionservice.usecase.cache

import java.util.UUID

interface SusbcriptionCache {
    fun get(userId: UUID): List<UUID>

    fun add(subscriberId: UUID, authorId: UUID)

    fun delete(subscriberId: UUID, authorId: UUID)
}