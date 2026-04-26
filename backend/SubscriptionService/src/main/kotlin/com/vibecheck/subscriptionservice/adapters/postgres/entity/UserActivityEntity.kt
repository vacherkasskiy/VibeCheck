package com.vibecheck.subscriptionservice.adapters.postgres.entity

import com.vibecheck.subscriptionservice.domain.UserActivity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "user_activity")
class UserActivityEntity {
    @Id
    var id: UUID? = null

    var userId: UUID? = null

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
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
