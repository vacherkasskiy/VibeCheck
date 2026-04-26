package com.vibecheck.subscriptionservice.adapters.rest.dto

import com.vibecheck.subscriptionservice.domain.UserFeed

data class FeedPageDto(
    val totalCount: Int,
    val activities: List<UserFeedDto>
) {
}

fun Pair<Int, List<UserFeed>>.toDto(): FeedPageDto =
    FeedPageDto(
        totalCount = first,
        activities = second.map { it.toDto() }
    )