package com.vibecheck.subscriptionservice.usecase.storage

import com.vibecheck.subscriptionservice.domain.UserActivity
import java.time.Instant
import java.util.UUID

interface UserActivityStorage {
    fun create(activity: UserActivity)
    fun getByIds(ids: Collection<UUID>): List<UserActivity>
    fun getLatestByUserId(userId: UUID, limit: Int): List<UserActivity>
    fun getFeedPage(
        authorIds: Collection<UUID>,
        limit: Int,
        cursorCreatedAt: Instant? = null,
        cursorActivityId: UUID? = null,
    ): List<UserActivity>
}
