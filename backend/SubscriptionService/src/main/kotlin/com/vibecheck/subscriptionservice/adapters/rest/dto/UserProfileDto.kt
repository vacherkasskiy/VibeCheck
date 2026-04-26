package com.vibecheck.subscriptionservice.adapters.rest.dto

import com.vibecheck.subscriptionservice.domain.UserProfile
import java.util.UUID

data class UserProfileDto(
    val userId: UUID,
    val name: String,
    val iconId: String
)

fun UserProfile.toDto(): UserProfileDto =
    UserProfileDto(
        userId = userId,
        name = name,
        iconId = avatarId
    )
