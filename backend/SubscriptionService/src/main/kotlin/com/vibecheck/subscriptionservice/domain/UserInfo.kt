package com.vibecheck.subscriptionservice.domain

import java.util.UUID

sealed interface UserInfo {
    val type: UserInfoType
}

data class ReviewWrittenInfo(
    val reviewId: String,
    val reviewCompanyId: String,
    val reviewCompanyName : String,
) : UserInfo {
    override val type: UserInfoType = UserInfoType.REVIEW_WRITTEN
}

data class ReviewLikedInfo(
    val reviewId: String,
    val reviewAuthorId: UUID,
    val reviewCompanyId: String,
    val reviewCompanyName : String,
) : UserInfo {
    override val type: UserInfoType = UserInfoType.REVIEW_LIKED

}

data class AchievementGrantedInfo(
    val achievementId: String,
    val achievementName: String,
) : UserInfo {
    override val type: UserInfoType = UserInfoType.ACHIEVEMENT_UNLOCKED
}

data class UserFollowedInfo(
    val userId: UUID,
    val name: String
) : UserInfo {
    override val type: UserInfoType = UserInfoType.USER_FOLLOWED
}

data class UserLevelUpInfo(
    val newLevel: Int,
) : UserInfo {
    override val type: UserInfoType = UserInfoType.LEVEL_UP
}
