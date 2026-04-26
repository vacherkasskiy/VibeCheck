package com.vibecheck.subscriptionservice.adapters.kafka

import com.google.protobuf.Timestamp
import com.vibecheck.subscriptionservice.domain.Sex
import com.vibecheck.subscriptionservice.domain.UserProfile
import org.springframework.stereotype.Service
import user.profile.v1.UserEvents
import java.time.Instant
import java.util.UUID

@Service
class UserProfileEventMapper {
    fun toDomain(event: UserEvents.UserProfileUpdatedEvent): UserProfile =
        UserProfile(
            userId = UUID.fromString(event.userId),
            version = event.profileVersion.toInt(),
            name = event.name,
            avatarId = event.iconId,
            sex = event.sex.toDomain(),
            birthday = event.birthday.toInstant(),
        )

    private fun UserEvents.Sex.toDomain(): Sex = when (this) {
        UserEvents.Sex.SEX_MALE -> Sex.SEX_MALE
        UserEvents.Sex.SEX_FEMALE -> Sex.SEX_FEMALE
        UserEvents.Sex.SEX_OTHER -> Sex.SEX_OTHER
        UserEvents.Sex.SEX_UNSPECIFIED, UserEvents.Sex.UNRECOGNIZED -> Sex.SEX_OTHER
    }

    private fun Timestamp.toInstant(): Instant = Instant.ofEpochSecond(seconds, nanos.toLong())
}
