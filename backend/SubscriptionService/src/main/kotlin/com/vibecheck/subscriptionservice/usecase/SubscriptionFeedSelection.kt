package com.vibecheck.subscriptionservice.usecase

import com.vibecheck.subscriptionservice.domain.UserFeed
import com.vibecheck.subscriptionservice.usecase.cache.ActivityCache
import com.vibecheck.subscriptionservice.usecase.cache.FollowingCache
import com.vibecheck.subscriptionservice.usecase.cache.UserActivityCache
import com.vibecheck.subscriptionservice.usecase.cache.UserProfileCache
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class SubscriptionFeedSelection(
    private val activityCache: ActivityCache,
    private val userActivityCache: UserActivityCache,
    private val userProfileCache: UserProfileCache,
    private val followingCache: FollowingCache,
) {
    fun select(userId: UUID, offset: Int, limit: Int): Pair<Int, List<UserFeed>> {
        val followingUserIds = followingCache.get(userId)

        val userActivityIds = userActivityCache.get(followingUserIds)

        val feed = userActivityIds.flatMap { (userId, activityIds) ->
            val profile = userProfileCache.get(userId)
            val activities = activityCache.get(activityIds)
            activities.map { activity -> UserFeed(activity.id, profile, activity.activityInfo, activity.createdAt) }
        }

        val totalCount = feed.count()
        val page = feed
            .sortedByDescending { it.createdAt }
            .drop(offset)
            .take(limit)

        return Pair(totalCount, page)
    }
}