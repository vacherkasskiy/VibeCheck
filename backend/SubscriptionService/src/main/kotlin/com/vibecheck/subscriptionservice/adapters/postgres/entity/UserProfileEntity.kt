package com.vibecheck.subscriptionservice.adapters.postgres.entity

import com.vibecheck.subscriptionservice.domain.Sex
import com.vibecheck.subscriptionservice.domain.UserProfile
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "user_profile")
class UserProfileEntity {
    @Id
    var userId: UUID? = null

    var version: Int? = null

    var name: String? = null

    var avatarId: String? = null

    @Enumerated(EnumType.STRING)
    var sex: Sex? = null

    var birthday: Instant? = null

    fun fill(domain: UserProfile): UserProfileEntity = apply {
        userId = domain.userId
        version = domain.version
        name = domain.name
        avatarId = domain.avatarId
        sex = domain.sex
        birthday = domain.birthday
    }
}

fun UserProfile.toEntity(): UserProfileEntity = UserProfileEntity().fill(this)

fun UserProfileEntity.toDomain(): UserProfile =
    UserProfile(
        userId = requireNotNull(userId),
        version = requireNotNull(version),
        name = requireNotNull(name),
        avatarId = requireNotNull(avatarId),
        sex = requireNotNull(sex),
        birthday = requireNotNull(birthday),
    )
