package com.vibecheck.subscriptionservice.adapters.redis

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.vibecheck.subscriptionservice.domain.AchievementGrantedInfo
import com.vibecheck.subscriptionservice.domain.ReviewLikedInfo
import com.vibecheck.subscriptionservice.domain.ReviewWrittenInfo
import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.domain.UserFollowedInfo
import com.vibecheck.subscriptionservice.domain.UserInfo
import com.vibecheck.subscriptionservice.domain.UserInfoType
import com.vibecheck.subscriptionservice.domain.UserLevelUpInfo
import java.time.Instant
import java.util.UUID

data class ActivityCacheDto(
    val id: UUID,
    val userId: UUID,
    val activityInfo: ActivityInfoCacheDto,
    val createdAt: Instant,
    val expiredAt: Instant,
)

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = ReviewWrittenInfoCacheDto::class, name = "REVIEW_WRITTEN"),
    JsonSubTypes.Type(value = ReviewLikedInfoCacheDto::class, name = "REVIEW_LIKED"),
    JsonSubTypes.Type(value = AchievementGrantedInfoCacheDto::class, name = "ACHIEVEMENT_UNLOCKED"),
    JsonSubTypes.Type(value = UserFollowedInfoCacheDto::class, name = "USER_FOLLOWED"),
    JsonSubTypes.Type(value = UserLevelUpInfoCacheDto::class, name = "LEVEL_UP"),
)
sealed interface ActivityInfoCacheDto {
    val type: UserInfoType
}

data class ReviewWrittenInfoCacheDto(
    val reviewId: String,
    val reviewCompanyId: String,
    val reviewCompanyName: String,
) : ActivityInfoCacheDto {
    override val type: UserInfoType = UserInfoType.REVIEW_WRITTEN
}

data class ReviewLikedInfoCacheDto(
    val reviewId: String,
    val reviewAuthorId: UUID,
    val reviewCompanyId: String,
    val reviewCompanyName: String,
) : ActivityInfoCacheDto {
    override val type: UserInfoType = UserInfoType.REVIEW_LIKED
}

data class AchievementGrantedInfoCacheDto(
    val achievementId: String,
    val achievementName: String,
) : ActivityInfoCacheDto {
    override val type: UserInfoType = UserInfoType.ACHIEVEMENT_UNLOCKED
}

data class UserFollowedInfoCacheDto(
    val userId: UUID,
    val name: String,
) : ActivityInfoCacheDto {
    override val type: UserInfoType = UserInfoType.USER_FOLLOWED
}

data class UserLevelUpInfoCacheDto(
    val newLevel: Int,
) : ActivityInfoCacheDto {
    override val type: UserInfoType = UserInfoType.LEVEL_UP
}

fun UserActivity.toCacheDto(): ActivityCacheDto = ActivityCacheDto(
    id = id,
    userId = userId,
    activityInfo = activityInfo.toCacheDto(),
    createdAt = createdAt,
    expiredAt = expiredAt,
)

fun ActivityCacheDto.toDomain(): UserActivity = UserActivity(
    id = id,
    userId = userId,
    activityInfo = activityInfo.toDomain(),
    createdAt = createdAt,
    expiredAt = expiredAt,
)

private fun UserInfo.toCacheDto(): ActivityInfoCacheDto =
    when (this) {
        is ReviewWrittenInfo -> ReviewWrittenInfoCacheDto(reviewId, reviewCompanyId, reviewCompanyName)
        is ReviewLikedInfo -> ReviewLikedInfoCacheDto(reviewId, reviewAuthorId, reviewCompanyId, reviewCompanyName)
        is AchievementGrantedInfo -> AchievementGrantedInfoCacheDto(achievementId, achievementName)
        is UserFollowedInfo -> UserFollowedInfoCacheDto(userId, name)
        is UserLevelUpInfo -> UserLevelUpInfoCacheDto(newLevel)
    }

private fun ActivityInfoCacheDto.toDomain(): UserInfo =
    when (this) {
        is ReviewWrittenInfoCacheDto -> ReviewWrittenInfo(reviewId, reviewCompanyId, reviewCompanyName)
        is ReviewLikedInfoCacheDto -> ReviewLikedInfo(reviewId, reviewAuthorId, reviewCompanyId, reviewCompanyName)
        is AchievementGrantedInfoCacheDto -> AchievementGrantedInfo(achievementId, achievementName)
        is UserFollowedInfoCacheDto -> UserFollowedInfo(userId, name)
        is UserLevelUpInfoCacheDto -> UserLevelUpInfo(newLevel)
    }
