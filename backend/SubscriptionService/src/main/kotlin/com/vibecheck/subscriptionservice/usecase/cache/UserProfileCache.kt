package com.vibecheck.subscriptionservice.usecase.cache

import com.vibecheck.subscriptionservice.domain.UserProfile
import java.util.UUID

interface UserProfileCache {
    fun get(userId: UUID): UserProfile

    fun createOrUpdate(userProfile: UserProfile)
}