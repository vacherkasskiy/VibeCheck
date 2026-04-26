package com.vibecheck.subscriptionservice.usecase

import com.vibecheck.subscriptionservice.domain.UserProfile
import com.vibecheck.subscriptionservice.usecase.cache.FollowingCache
import com.vibecheck.subscriptionservice.usecase.provider.CachedUserProfileProvider
import com.vibecheck.subscriptionservice.usecase.storage.SubscriptionStorage
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class SubscriptionSelection(
    private val followingCache: FollowingCache,
    private val subscriptionStorage: SubscriptionStorage,
    private val cachedUserProfileProvider: CachedUserProfileProvider,
) {
    fun select(userId: UUID): List<UserProfile> =
        resolveFollowingAuthorIds(userId)
            .map(cachedUserProfileProvider::get)

    private fun resolveFollowingAuthorIds(userId: UUID): List<UUID> {
        val cachedAuthorIds = followingCache.get(userId)
        if (cachedAuthorIds.isNotEmpty()) {
            return cachedAuthorIds
        }

        val authorIdsFromStorage = subscriptionStorage.findAuthorIdsBySubscriberId(userId)
        authorIdsFromStorage.forEach { authorId ->
            followingCache.add(authorId = authorId, subscriberId = userId)
        }

        return authorIdsFromStorage
    }
}
