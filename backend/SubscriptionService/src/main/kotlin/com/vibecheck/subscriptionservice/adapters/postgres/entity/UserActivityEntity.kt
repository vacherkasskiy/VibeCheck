package com.vibecheck.subscriptionservice.adapters.postgres.entity

import com.vibecheck.subscriptionservice.domain.UserActivity
import java.time.Instant
import java.util.UUID

class UserActivityEntity {
    var id: UUID? = null

    var userId: UUID? = null

    var activityInfo: UserInfoDto? = null

    var createdAt: Instant? = null

    var expiredAt: Instant? = null

    fun fill(domain: UserActivity) : UserActivityEntity = apply {
        id = domain.id
        userId = domain.userId
        activityInfo = domain.activityInfo.toDto()
        createdAt = domain.createdAt
        expiredAt = domain.expiredAt
    }
}

fun UserActivity.toEntity(): UserActivityEntity = UserActivityEntity().fill(this)

fun UserActivityEntity.toDomain(): UserActivity =
    UserActivity(
        id = requireNotNull(id),
        userId = requireNotNull(userId),
        activityInfo = requireNotNull(activityInfo).toDomain(),
        createdAt = requireNotNull(createdAt),
        expiredAt = requireNotNull(expiredAt),
    )
