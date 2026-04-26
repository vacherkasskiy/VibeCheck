package com.vibecheck.subscriptionservice.usecase.provider

import com.vibecheck.subscriptionservice.domain.UserProfile
import com.vibecheck.subscriptionservice.domain.exception.NotFoundException
import com.vibecheck.subscriptionservice.usecase.cache.UserProfileCache
import com.vibecheck.subscriptionservice.usecase.storage.UserProfileStorage
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class CachedUserProfileProvider(
    private val userProfileCache: UserProfileCache,
    private val userProfileStorage: UserProfileStorage,
) {
    fun get(userId: UUID): UserProfile =
        userProfileCache.get(userId)
            ?: userProfileStorage.get(userId)?.also(userProfileCache::put)
            ?: throw NotFoundException("User profile $userId not found")

    fun getOrNull(userId: UUID): UserProfile? =
        userProfileCache.get(userId)
            ?: userProfileStorage.get(userId)?.also(userProfileCache::put)
}