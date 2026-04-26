package com.vibecheck.userservice.domain.events

import com.vibecheck.userservice.domain.UserProfile
import java.util.UUID

data class UserInfoCreatedEvent(
    val userId: UUID,
    val userProfile: UserProfile,
)
