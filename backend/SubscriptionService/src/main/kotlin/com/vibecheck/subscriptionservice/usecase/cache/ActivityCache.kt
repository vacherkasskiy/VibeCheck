package com.vibecheck.subscriptionservice.usecase.cache

import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.domain.UserInfo
import java.util.UUID

interface ActivityCache {
    fun get(ids: Collection<UUID>): List<UserActivity>

    fun add(userActivity: UserActivity)
}