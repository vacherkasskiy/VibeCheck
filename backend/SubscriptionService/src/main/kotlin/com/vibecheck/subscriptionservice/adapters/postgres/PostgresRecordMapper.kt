package com.vibecheck.subscriptionservice.adapters.postgres

import com.vibecheck.subscriptionservice.domain.Sex
import com.vibecheck.subscriptionservice.domain.Subscription
import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.domain.UserProfile
import org.jooq.Field
import org.jooq.JSONB
import org.jooq.Record
import org.springframework.stereotype.Component
import java.sql.Timestamp
import java.time.Instant
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneOffset
import tools.jackson.databind.ObjectMapper

@Component
class PostgresRecordMapper(
    private val objectMapper: ObjectMapper,
) {
    fun toSubscription(record: Record): Subscription = Subscription(
        authorId = requireNotNull(record.get(SubscriptionsTable.AUTHOR_ID)),
        subscriberId = requireNotNull(record.get(SubscriptionsTable.SUBSCRIBER_ID)),
        createdAt = instant(record, SubscriptionsTable.CREATED_AT),
    )

    fun toUserActivity(record: Record): UserActivity = UserActivity(
        id = requireNotNull(record.get(UserActivityTable.ID)),
        userId = requireNotNull(record.get(UserActivityTable.USER_ID)),
        activityInfo = readUserInfo(requireNotNull(record.get(UserActivityTable.ACTIVITY_INFO))).toDomain(),
        createdAt = instant(record, UserActivityTable.CREATED_AT),
        expiredAt = instant(record, UserActivityTable.EXPIRED_AT),
    )

    fun toUserProfile(record: Record): UserProfile = UserProfile(
        userId = requireNotNull(record.get(UserProfileTable.USER_ID)),
        version = requireNotNull(record.get(UserProfileTable.VERSION)),
        name = requireNotNull(record.get(UserProfileTable.NAME)),
        avatarId = requireNotNull(record.get(UserProfileTable.AVATAR_ID)),
        sex = Sex.valueOf(requireNotNull(record.get(UserProfileTable.SEX))),
        birthday = instant(record, UserProfileTable.BIRTHDAY),
        isDefault = false,
    )

    fun toJsonb(value: Any): JSONB = JSONB.jsonb(objectMapper.writeValueAsString(value))

    private fun readUserInfo(value: JSONB): UserInfoDto =
        objectMapper.readValue(value.data(), UserInfoDto::class.java)

    @Suppress("UNCHECKED_CAST")
    private fun instant(record: Record, field: Field<*>): Instant =
        instantOrNull(record, field) ?: error("Field ${field.name} is null")

    @Suppress("UNCHECKED_CAST")
    private fun instantOrNull(record: Record, field: Field<*>): Instant? =
        when (val value = record.get(field as Field<Any?>)) {
            null -> null
            is Instant -> value
            is OffsetDateTime -> value.toInstant()
            is Timestamp -> value.toInstant()
            is LocalDateTime -> value.toInstant(ZoneOffset.UTC)
            else -> error("Unsupported temporal value for ${field.name}: ${value::class.qualifiedName}")
        }
}
