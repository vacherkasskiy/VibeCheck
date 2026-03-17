package com.vibecheck.subscriptionservice.usecase.storage

import com.vibecheck.subscriptionservice.domain.UserActivity

interface UserActivityStorage {
    fun create(activity: UserActivity)
}