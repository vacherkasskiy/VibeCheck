package com.vibecheck.subscriptionservice.adapters.rest.dto

import com.vibecheck.subscriptionservice.domain.UserFeed
import com.vibecheck.subscriptionservice.domain.UserInfo
import com.vibecheck.subscriptionservice.domain.UserInfoType
import io.lettuce.core.search.arguments.SugAddArgs.Builder.payload
import java.time.Instant
import java.util.UUID

data class UserFeedDto(
    val activityId: UUID,
    val actor: UserProfileDto,
    val createdAt: Instant,
    val payload: UserInfoDto
)

fun UserFeed.toDto(): UserFeedDto = UserFeedDto(
    activityId = activityId,
    actor = profile.toDto(),
    createdAt = createdAt,
    payload = feed.toDto()
)
