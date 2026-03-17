package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.UserProfile
import java.util.UUID

interface UserProfileStorage {
    fun findById(userId: UUID): UserProfile

    fun create(userProfile: UserProfile): UserProfile

    fun update(userProfile: UserProfile): UserProfile
}