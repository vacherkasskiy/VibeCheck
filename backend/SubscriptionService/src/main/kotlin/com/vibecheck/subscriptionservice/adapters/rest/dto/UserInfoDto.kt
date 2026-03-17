package com.vibecheck.subscriptionservice.adapters.rest.dto

import com.vibecheck.subscriptionservice.domain.AchievementGrantedInfo
import com.vibecheck.subscriptionservice.domain.ReviewLikedInfo
import com.vibecheck.subscriptionservice.domain.ReviewWrittenInfo
import com.vibecheck.subscriptionservice.domain.UserFollowedInfo
import com.vibecheck.subscriptionservice.domain.UserInfo
import com.vibecheck.subscriptionservice.domain.UserInfoType
import com.vibecheck.subscriptionservice.domain.UserLevelUpInfo
import java.util.UUID

sealed interface UserInfoDto {
    val type: UserInfoType
}

data class ReviewWrittenInfoDto(
    val reviewId: String,
    val companyId: String,
    val companyName : String,
) : UserInfoDto {
    override val type: UserInfoType = UserInfoType.REVIEW_WRITTEN
}

data class ReviewLikedInfoDto(
    val reviewId: String,
    val reviewAuthorId: UUID,
    val companyId: String,
    val companyName : String,
) : UserInfoDto {
    override val type: UserInfoType = UserInfoType.REVIEW_LIKED

}

data class AchievementGrantedInfoDto(
    val achievementId: String,
    val displayName: String,
) : UserInfoDto {
    override val type: UserInfoType = UserInfoType.ACHIEVEMENT_UNLOCKED
}

data class UserFollowedInfoDto(
    val userId: UUID,
    val displayName: String
) : UserInfoDto {
    override val type: UserInfoType = UserInfoType.USER_FOLLOWED
}

data class UserLevelUpInfoDto(
    val newLevel: Int,
) : UserInfoDto {
    override val type: UserInfoType = UserInfoType.LEVEL_UP
}

fun UserInfo.toDto(): UserInfoDto =
    when (this) {
        is ReviewLikedInfo -> ReviewLikedInfoDto(reviewId, reviewAuthorId, reviewCompanyId, reviewCompanyName)
        is AchievementGrantedInfo -> AchievementGrantedInfoDto(achievementId, achievementName)
        is ReviewWrittenInfo -> ReviewWrittenInfoDto(reviewId, reviewCompanyId, reviewCompanyName)
        is UserFollowedInfo -> UserFollowedInfoDto(userId, name)
        is UserLevelUpInfo -> UserLevelUpInfoDto(newLevel)
    }