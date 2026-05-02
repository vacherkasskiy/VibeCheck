package com.vibecheck.userservice.usecase.cache

import java.time.Instant
import java.util.UUID

interface AccessTokenBlacklistCache {
    fun put(tokenId: String)
    fun put(userId: UUID)
    fun remove(userId: UUID)
    fun isExists(tokenId: String): Boolean
    fun getAddedAt(userId: UUID): Instant?
}
