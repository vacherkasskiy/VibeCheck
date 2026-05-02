package com.vibecheck.subscriptionservice.adapters.postgres.entity

import com.vibecheck.subscriptionservice.domain.Sex
import com.vibecheck.subscriptionservice.domain.UserProfile
import java.time.Instant
import java.util.UUID

class UserProfileEntity {
    var userId: UUID? = null

    var version: Int? = null

    var name: String? = null

    var avatarId: String? = null

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
        isDefault = false,
    )
