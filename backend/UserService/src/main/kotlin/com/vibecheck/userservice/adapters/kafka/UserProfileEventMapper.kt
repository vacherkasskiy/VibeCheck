package com.vibecheck.userservice.adapters.kafka

import com.vibecheck.userservice.domain.Education
import com.vibecheck.userservice.domain.Sex
import com.vibecheck.userservice.usecase.UserInfo
import common.EventMetadataOuterClass
import com.google.protobuf.Timestamp
import com.vibecheck.userservice.domain.Speciality
import com.vibecheck.userservice.domain.UserProfile
import org.springframework.stereotype.Service
import user.profile.v1.UserEvents
import java.time.Clock
import java.time.Instant

@Service
class UserProfileEventMapper(
    private val clock: Clock
) {
    fun toEvent(userInfo: UserProfile): UserEvents.UserProfileUpdatedEvent {
        val metadata = EventMetadataOuterClass.EventMetadata.newBuilder()
            .apply {
                setEventId(userInfo.userId.toString())
                setEventType("user.profile.updated")
                setAggregateId(userInfo.userId.toString())
                setPayloadVersion(1)
                setOccurredAt(clock.instant().toProtoTimestamp())
                setSource(EventMetadataOuterClass.SourceType.USER_SERVICE)
            }
            .build()

        return UserEvents.UserProfileUpdatedEvent.newBuilder().apply {
            setMetadata(metadata)
            setMetadata(metadata)
            setUserId(userInfo.userId.toString())
            setProfileVersion(userInfo.version.toLong())
            setName(userInfo.name)
            setIconId(userInfo.avatarId)
            setBirthday(userInfo.birthday.toProtoTimestamp())
            setSex(userInfo.sex.toProto())
            setEducation(userInfo.education.toProto())
            setSpecialization(userInfo.speciality.toProto())

            userInfo.workExperience.map { work ->
                val workMessage = UserEvents.WorkExperience.newBuilder()
                    .setSpecialization(work.speciality.toProto())
                    .setStartedAt(work.startedAt.toProtoTimestamp())
                    .apply {
                        work.endedAt?.let { setFinishedAt(it.toProtoTimestamp()) }
                    }
                    .build()

                addWorkExperience(workMessage)
            }
        }
            .build()
    }

    private fun Instant.toProtoTimestamp(): Timestamp =
        Timestamp.newBuilder()
            .setSeconds(this.epochSecond)
            .setNanos(this.nano)
            .build()

    private fun Sex.toProto(): UserEvents.Sex = when (this) {
        Sex.SEX_MALE -> UserEvents.Sex.SEX_MALE
        Sex.SEX_FEMALE -> UserEvents.Sex.SEX_FEMALE
        Sex.SEX_OTHER -> UserEvents.Sex.SEX_OTHER
    }

    private fun Education.toProto(): UserEvents.Education = when (this) {
        Education.EDUCATION_LEVEL_NONE -> UserEvents.Education.EDUCATION_LEVEL_NONE
        Education.EDUCATION_LEVEL_PRIMARY -> UserEvents.Education.EDUCATION_LEVEL_PRIMARY
        Education.EDUCATION_LEVEL_BASIC -> UserEvents.Education.EDUCATION_LEVEL_BASIC
        Education.EDUCATION_LEVEL_SECONDARY -> UserEvents.Education.EDUCATION_LEVEL_SECONDARY
        Education.EDUCATION_LEVEL_SECONDARY_PROFESSIONAL -> UserEvents.Education.EDUCATION_LEVEL_SECONDARY_PROFESSIONAL
        Education.EDUCATION_LEVEL_INCOMPLETE_HIGHER -> UserEvents.Education.EDUCATION_LEVEL_INCOMPLETE_HIGHER
        Education.EDUCATION_LEVEL_BACHELOR -> UserEvents.Education.EDUCATION_LEVEL_BACHELOR
        Education.EDUCATION_LEVEL_SPECIALIST -> UserEvents.Education.EDUCATION_LEVEL_SPECIALIST
        Education.EDUCATION_LEVEL_MASTER -> UserEvents.Education.EDUCATION_LEVEL_MASTER
        Education.EDUCATION_LEVEL_POSTGRADUATE -> UserEvents.Education.EDUCATION_LEVEL_POSTGRADUATE
        Education.EDUCATION_LEVEL_DOCTORATE -> UserEvents.Education.EDUCATION_LEVEL_DOCTORATE
        Education.EDUCATION_LEVEL_RESIDENCY -> UserEvents.Education.EDUCATION_LEVEL_RESIDENCY
        Education.EDUCATION_LEVEL_ADJUNCTURE -> UserEvents.Education.EDUCATION_LEVEL_ADJUNCTURE
    }

    private fun Speciality.toProto(): UserEvents.Specialization = when (this) {
        Speciality.SPECIALTY_IT -> UserEvents.Specialization.SPECIALTY_IT
        Speciality.SPECIALTY_DESIGN -> UserEvents.Specialization.SPECIALTY_DESIGN
        Speciality.SPECIALTY_MARKETING -> UserEvents.Specialization.SPECIALTY_MARKETING
        Speciality.SPECIALTY_FINANCE -> UserEvents.Specialization.SPECIALTY_FINANCE
        Speciality.SPECIALTY_HR -> UserEvents.Specialization.SPECIALTY_HR
        Speciality.SPECIALTY_SALES -> UserEvents.Specialization.SPECIALTY_SALES
        Speciality.SPECIALTY_LOGISTICS -> UserEvents.Specialization.SPECIALTY_LOGISTICS
        Speciality.SPECIALTY_LAW -> UserEvents.Specialization.SPECIALTY_LAW
        Speciality.SPECIALTY_EDUCATION -> UserEvents.Specialization.SPECIALTY_EDUCATION
        Speciality.SPECIALTY_MEDICINE -> UserEvents.Specialization.SPECIALTY_MEDICINE
        Speciality.SPECIALTY_CONSTRUCTION -> UserEvents.Specialization.SPECIALTY_CONSTRUCTION
        Speciality.SPECIALTY_ENGINEERING -> UserEvents.Specialization.SPECIALTY_ENGINEERING
        Speciality.SPECIALTY_ART -> UserEvents.Specialization.SPECIALTY_ART
        Speciality.SPECIALTY_TOURISM -> UserEvents.Specialization.SPECIALTY_TOURISM
        Speciality.SPECIALTY_MEDIA -> UserEvents.Specialization.SPECIALTY_MEDIA
        Speciality.SPECIALTY_ANALYTICS -> UserEvents.Specialization.SPECIALTY_ANALYTICS
        Speciality.SPECIALTY_PROJECT_MANAGEMENT -> UserEvents.Specialization.SPECIALTY_PROJECT_MANAGEMENT
        Speciality.SPECIALTY_SPORT -> UserEvents.Specialization.SPECIALTY_SPORT
        Speciality.SPECIALTY_OTHER -> UserEvents.Specialization.SPECIALTY_OTHER
    }
}