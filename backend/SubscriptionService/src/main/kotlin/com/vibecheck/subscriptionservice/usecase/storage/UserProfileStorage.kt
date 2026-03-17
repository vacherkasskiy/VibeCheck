package com.vibecheck.subscriptionservice.usecase.storage

import com.vibecheck.subscriptionservice.domain.UserProfile

interface UserProfileStorage {
    fun createOrUpdate(userProfile: UserProfile)
}