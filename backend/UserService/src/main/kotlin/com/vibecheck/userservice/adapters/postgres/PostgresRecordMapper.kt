package com.vibecheck.userservice.adapters.postgres

import com.fasterxml.jackson.databind.ObjectMapper
import com.vibecheck.userservice.domain.Avatar
import com.vibecheck.userservice.domain.Education
import com.vibecheck.userservice.domain.OnboardingStep
import com.vibecheck.userservice.domain.Sex
import com.vibecheck.userservice.domain.Speciality
import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.domain.UserConfirmation
import com.vibecheck.userservice.domain.UserOnboardingStep
import com.vibecheck.userservice.domain.UserOnboardingStepStatus
import com.vibecheck.userservice.domain.UserProfile
import com.vibecheck.userservice.domain.UserRole
import com.vibecheck.userservice.domain.auth.RefreshToken
import com.vibecheck.userservice.domain.auth.UserLoginDevice
import com.vibecheck.userservice.domain.report.ProcessedReportEvent
import com.vibecheck.userservice.domain.report.ReportReasonType
import com.vibecheck.userservice.domain.report.ReportSource
import com.vibecheck.userservice.domain.report.ReportStatus
import com.vibecheck.userservice.domain.report.UserProfileReport
import com.vibecheck.userservice.domain.report.UserReport
import com.vibecheck.userservice.domain.report.UserReviewReport
import org.jooq.Field
import org.jooq.JSONB
import org.jooq.Record
import org.springframework.stereotype.Component
import java.sql.Timestamp
import java.time.Instant
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneOffset

@Component
class PostgresRecordMapper(
    private val objectMapper: ObjectMapper,
) {
    fun toAvatar(record: Record): Avatar = Avatar(
        id = requireNotNull(record.get(AvatarsTable.ID)),
        version = requireNotNull(record.get(AvatarsTable.VERSION)),
        url = requireNotNull(record.get(AvatarsTable.URL)),
    )

    fun toUser(record: Record): User = User(
        id = requireNotNull(record.get(UsersTable.ID)),
        version = requireNotNull(record.get(UsersTable.VERSION)),
        email = requireNotNull(record.get(UsersTable.EMAIL)),
        password = requireNotNull(record.get(UsersTable.PASSWORD)),
        roles = readRoles(requireNotNull(record.get(UsersTable.ROLES))),
        isBanned = requireNotNull(record.get(UsersTable.IS_BANNED)),
    )

    fun toUserProfile(record: Record): UserProfile = UserProfile(
        userId = requireNotNull(record.get(UserProfileTable.USER_ID)),
        version = requireNotNull(record.get(UserProfileTable.VERSION)),
        name = requireNotNull(record.get(UserProfileTable.NAME)),
        avatarId = requireNotNull(record.get(UserProfileTable.AVATAR_ID)),
        sex = Sex.valueOf(requireNotNull(record.get(UserProfileTable.SEX))),
        birthday = instant(record, UserProfileTable.BIRTHDAY),
        education = Education.valueOf(requireNotNull(record.get(UserProfileTable.EDUCATION))),
        speciality = Speciality.valueOf(requireNotNull(record.get(UserProfileTable.SPECIALITY))),
        workExperience = readWorkExperiences(requireNotNull(record.get(UserProfileTable.WORK_EXPERIENCE)))
            .map { it.toDomain() },
    )

    fun toOnboardingStep(record: Record): OnboardingStep = OnboardingStep(
        id = requireNotNull(record.get(OnboardingStepTable.ID)),
        nextStepId = record.get(OnboardingStepTable.NEXT_STEP_ID),
        isPrimary = requireNotNull(record.get(OnboardingStepTable.IS_PRIMARY)),
    )

    fun toUserOnboardingStep(record: Record): UserOnboardingStep = UserOnboardingStep(
        id = requireNotNull(record.get(UserOnboardingStepTable.ID)),
        userId = requireNotNull(record.get(UserOnboardingStepTable.USER_ID)),
        stepId = requireNotNull(record.get(UserOnboardingStepTable.STEP_ID)),
        version = requireNotNull(record.get(UserOnboardingStepTable.VERSION)),
        status = UserOnboardingStepStatus.valueOf(requireNotNull(record.get(UserOnboardingStepTable.STATUS))),
    )

    fun toUserConfirmation(record: Record): UserConfirmation = UserConfirmation(
        email = requireNotNull(record.get(UserConfirmationTable.EMAIL)),
        password = requireNotNull(record.get(UserConfirmationTable.PASSWORD)),
        confirmCode = requireNotNull(record.get(UserConfirmationTable.CONFIRM_CODE)),
        expiredAt = instant(record, UserConfirmationTable.EXPIRED_AT),
    )

    fun toRefreshToken(record: Record): RefreshToken = RefreshToken(
        tokenId = requireNotNull(record.get(RefreshTokenTable.TOKEN_ID)),
        version = requireNotNull(record.get(RefreshTokenTable.VERSION)),
        user = toUser(record),
        tokenHash = requireNotNull(record.get(RefreshTokenTable.TOKEN_HASH)),
        issuedAt = instant(record, RefreshTokenTable.ISSUED_AT),
        expiredAt = instant(record, RefreshTokenTable.EXPIRES_AT),
        revokedAt = instantOrNull(record, RefreshTokenTable.REVOKED_AT),
        createdAt = instant(record, RefreshTokenTable.CREATED_AT),
    )

    fun toUserReport(record: Record): UserReport {
        val source = ReportSource.valueOf(requireNotNull(record.get(UserReportTable.SOURCE)))
        return when (source) {
            ReportSource.PROFILE -> UserProfileReport(
                reportId = requireNotNull(record.get(UserReportTable.REPORT_ID)),
                version = requireNotNull(record.get(UserReportTable.VERSION)),
                targetUserId = requireNotNull(record.get(UserReportTable.TARGET_USER_ID)),
                reporterUserId = requireNotNull(record.get(UserReportTable.REPORTER_USER_ID)),
                reasonType = ReportReasonType.valueOf(requireNotNull(record.get(UserReportTable.REASON_TYPE))),
                reasonText = record.get(UserReportTable.REASON_TEXT),
                status = ReportStatus.valueOf(requireNotNull(record.get(UserReportTable.STATUS))),
                createdAt = instant(record, UserReportTable.CREATED_AT),
            )
            ReportSource.REVIEW -> UserReviewReport(
                reportId = requireNotNull(record.get(UserReportTable.REPORT_ID)),
                version = requireNotNull(record.get(UserReportTable.VERSION)),
                targetUserId = requireNotNull(record.get(UserReportTable.TARGET_USER_ID)),
                reporterUserId = requireNotNull(record.get(UserReportTable.REPORTER_USER_ID)),
                reviewId = requireNotNull(record.get(UserReportTable.REVIEW_ID)),
                reasonType = ReportReasonType.valueOf(requireNotNull(record.get(UserReportTable.REASON_TYPE))),
                reasonText = record.get(UserReportTable.REASON_TEXT),
                status = ReportStatus.valueOf(requireNotNull(record.get(UserReportTable.STATUS))),
                createdAt = instant(record, UserReportTable.CREATED_AT),
                externalEventId = requireNotNull(record.get(UserReportTable.EXTERNAL_EVENT_ID)),
            )
        }
    }

    fun toProcessedReportEvent(record: Record): ProcessedReportEvent = ProcessedReportEvent(
        eventId = requireNotNull(record.get(ProcessedReportEventTable.EVENT_ID)),
        reportId = requireNotNull(record.get(ProcessedReportEventTable.REPORT_ID)),
        processedAt = instant(record, ProcessedReportEventTable.PROCESSED_AT),
    )

    fun toUserLoginDevice(record: Record): UserLoginDevice = UserLoginDevice(
        userId = requireNotNull(record.get(UserLoginDeviceTable.USER_ID)),
        fingerprint = requireNotNull(record.get(UserLoginDeviceTable.FINGERPRINT)),
        userAgent = requireNotNull(record.get(UserLoginDeviceTable.USER_AGENT)),
        ipAddress = record.get(UserLoginDeviceTable.IP_ADDRESS),
        createdAt = instant(record, UserLoginDeviceTable.CREATED_AT),
    )

    fun toJsonb(value: Any): JSONB = JSONB.jsonb(objectMapper.writeValueAsString(value))

    private fun readRoles(value: JSONB): List<UserRole> =
        objectMapper.readValue(
            value.data(),
            objectMapper.typeFactory.constructCollectionType(List::class.java, UserRole::class.java),
        )

    private fun readWorkExperiences(value: JSONB): List<WorkExperienceDto> =
        objectMapper.readValue(
            value.data(),
            objectMapper.typeFactory.constructCollectionType(List::class.java, WorkExperienceDto::class.java),
        )

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
