package com.vibecheck.subscriptionservice.adapters.postgres

import com.vibecheck.subscriptionservice.adapters.postgres.entity.UserInfoDto
import com.vibecheck.subscriptionservice.adapters.postgres.entity.toDomain
import com.vibecheck.subscriptionservice.domain.Sex
import com.vibecheck.subscriptionservice.domain.Subscription
import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.domain.UserProfile
import org.jooq.JSONB
import org.jooq.Record
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component
class PostgresRecordMapper(
    private val objectMapper: ObjectMapper,
) {
    fun toSubscription(record: Record): Subscription = Subscription(
        authorId = requireNotNull(record.get(SubscriptionsTable.AUTHOR_ID)),
        subscriberId = requireNotNull(record.get(SubscriptionsTable.SUBSCRIBER_ID)),
        createdAt = requireNotNull(record.get(SubscriptionsTable.CREATED_AT)),
    )

    fun toUserActivity(record: Record): UserActivity = UserActivity(
        id = requireNotNull(record.get(UserActivityTable.ID)),
        userId = requireNotNull(record.get(UserActivityTable.USER_ID)),
        activityInfo = readUserInfo(requireNotNull(record.get(UserActivityTable.ACTIVITY_INFO))).toDomain(),
        createdAt = requireNotNull(record.get(UserActivityTable.CREATED_AT)),
        expiredAt = requireNotNull(record.get(UserActivityTable.EXPIRED_AT)),
    )

    fun toUserProfile(record: Record): UserProfile = UserProfile(
        userId = requireNotNull(record.get(UserProfileTable.USER_ID)),
        version = requireNotNull(record.get(UserProfileTable.VERSION)),
        name = requireNotNull(record.get(UserProfileTable.NAME)),
        avatarId = requireNotNull(record.get(UserProfileTable.AVATAR_ID)),
        sex = Sex.valueOf(requireNotNull(record.get(UserProfileTable.SEX))),
        birthday = requireNotNull(record.get(UserProfileTable.BIRTHDAY)),
        isDefault = false,
    )

    fun toJsonb(value: Any): JSONB = JSONB.jsonb(objectMapper.writeValueAsString(value))

    private fun readUserInfo(value: JSONB): UserInfoDto =
        objectMapper.readValue(value.data(), UserInfoDto::class.java)
}
