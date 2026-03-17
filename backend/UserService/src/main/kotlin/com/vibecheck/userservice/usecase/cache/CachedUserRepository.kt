package com.vibecheck.userservice.usecase.cache

import com.vibecheck.userservice.domain.User
import java.time.Duration
import java.util.UUID

interface CachedUserRepository {
    fun get(userId: UUID): User?
    fun put(user: User, ttl: Duration)
    fun evict(userId: UUID)
}