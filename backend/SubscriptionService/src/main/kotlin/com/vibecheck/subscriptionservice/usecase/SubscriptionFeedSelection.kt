package com.vibecheck.subscriptionservice.usecase

import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.domain.UserFeed
import com.vibecheck.subscriptionservice.usecase.cache.ActivityCache
import com.vibecheck.subscriptionservice.usecase.cache.FollowingCache
import com.vibecheck.subscriptionservice.usecase.cache.HeavyAuthorCache
import com.vibecheck.subscriptionservice.usecase.cache.SubscriberFeedCache
import com.vibecheck.subscriptionservice.usecase.cache.UserActivityCache
import com.vibecheck.subscriptionservice.usecase.provider.CachedUserProfileProvider
import com.vibecheck.subscriptionservice.usecase.storage.SubscriptionStorage
import com.vibecheck.subscriptionservice.usecase.storage.UserActivityStorage
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class SubscriptionFeedSelection(
    private val activityCache: ActivityCache,
    private val followingCache: FollowingCache,
    private val subscriberFeedCache: SubscriberFeedCache,
    private val userActivityCache: UserActivityCache,
    private val cachedUserProfileProvider: CachedUserProfileProvider,
    private val heavyAuthorCache: HeavyAuthorCache,
    private val subscriptionStorage: SubscriptionStorage,
    private val userActivityStorage: UserActivityStorage,
) {
    fun select(
        userId: UUID,
        limit: Int,
        cursorCreatedAt: Instant? = null,
        cursorActivityId: UUID? = null,
    ): Pair<Int, List<UserFeed>> {
        val followingAuthorIds = resolveFollowingAuthorIds(userId)
        if (followingAuthorIds.isEmpty() || limit <= 0) {
            return Pair(0, emptyList())
        }

        val activities = if (cursorCreatedAt != null && cursorActivityId != null) {
            userActivityStorage.getFeedPage(
                authorIds = followingAuthorIds,
                limit = limit,
                cursorCreatedAt = cursorCreatedAt,
                cursorActivityId = cursorActivityId,
            )
        } else {
            selectHotHead(userId, followingAuthorIds, limit)
        }

        val feed = activities.map { activity ->
            UserFeed(
                activityId = activity.id,
                profile = cachedUserProfileProvider.get(activity.userId),
                feed = activity.activityInfo,
                createdAt = activity.createdAt,
            )
        }

        return Pair(feed.size, feed)
    }

    private fun selectHotHead(userId: UUID, followingAuthorIds: List<UUID>, limit: Int) =
        mergeHotActivities(userId, followingAuthorIds)
            .let { hotActivities ->
                if (hotActivities.size >= limit) {
                    hotActivities.take(limit)
                } else {
                    val cursor = hotActivities.lastOrNull()
                    val dbActivities = userActivityStorage.getFeedPage(
                        authorIds = followingAuthorIds,
                        limit = limit - hotActivities.size,
                        cursorCreatedAt = cursor?.createdAt,
                        cursorActivityId = cursor?.id,
                    )

                    (hotActivities + dbActivities)
                        .distinctBy { it.id }
                        .sortedWith(compareByDescending<UserActivity> { it.createdAt }
                            .thenByDescending { it.id })
                        .take(limit)
                }
            }

    private fun mergeHotActivities(userId: UUID, followingAuthorIds: List<UUID>) =
        loadActivities(subscriberFeedCache.get(userId) + heavyActivityIds(followingAuthorIds))
            .filter { it.userId in followingAuthorIds }
            .distinctBy { it.id }
            .sortedWith(compareByDescending<UserActivity> { it.createdAt }
                .thenByDescending { it.id })

    private fun heavyActivityIds(followingAuthorIds: List<UUID>): List<UUID> =
        userActivityCache.get(heavyAuthorCache.getHeavyAuthorIds(followingAuthorIds))
            .values
            .flatten()

    private fun loadActivities(activityIds: List<UUID>): List<UserActivity> {
        if (activityIds.isEmpty()) {
            return emptyList()
        }

        val cachedActivities = activityCache.get(activityIds)
        val cachedById = cachedActivities.associateBy { it.id }
        val missingIds = activityIds.filterNot { cachedById.containsKey(it) }
        return if (missingIds.isEmpty()) {
            cachedActivities
        } else {
            val activitiesFromStorage = userActivityStorage.getByIds(missingIds)
            activitiesFromStorage.forEach(activityCache::add)
            cachedActivities + activitiesFromStorage
        }
    }

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
