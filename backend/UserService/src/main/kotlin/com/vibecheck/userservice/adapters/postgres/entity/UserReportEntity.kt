package com.vibecheck.userservice.adapters.postgres.entity

import com.vibecheck.userservice.domain.report.ReportReasonType
import com.vibecheck.userservice.domain.report.ReportSource
import com.vibecheck.userservice.domain.report.ReportStatus
import com.vibecheck.userservice.domain.report.UserProfileReport
import com.vibecheck.userservice.domain.report.UserReport
import com.vibecheck.userservice.domain.report.UserReviewReport
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.Version
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "user_reports")
class UserReportEntity {
    @Id
    @Column(name = "report_id", nullable = false, length = 255)
    var reportId: String? = null

    @Version
    var version: Int? = null

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    var source: ReportSource? = null

    @Column(name = "target_user_id", nullable = false)
    var targetUserId: UUID? = null

    @Column(name = "reporter_user_id", nullable = false)
    var reporterUserId: UUID? = null

    @Column(name = "review_id")
    var reviewId: String? = null

    @Enumerated(EnumType.STRING)
    @Column(name = "reason_type", nullable = false, length = 64)
    var reasonType: ReportReasonType? = null

    @Column(name = "reason_text", length = 1000)
    var reasonText: String? = null

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    var status: ReportStatus? = null

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant? = null

    @Column(name = "external_event_id", length = 255)
    var externalEventId: String? = null

    fun toEntity(domain: UserReport): UserReportEntity = apply {
        reportId = domain.reportId
        version = takeIf { domain.version != 0 }?.let { domain.version }
        source = domain.source
        targetUserId = domain.targetUserId
        reporterUserId = domain.reporterUserId
        reviewId = if (domain is UserReviewReport) domain.reviewId else null
        reasonType = domain.reasonType
        reasonText = domain.reasonText
        status = domain.status
        createdAt = domain.createdAt
        externalEventId = if (domain is UserReviewReport) domain.externalEventId else null
    }

    fun toDomain(): UserReport = when(requireNotNull(source)) {
        ReportSource.PROFILE -> UserProfileReport(
            reportId = requireNotNull(reportId),
            version = requireNotNull(version),
            targetUserId = requireNotNull(targetUserId),
            reporterUserId = requireNotNull(reporterUserId),
            reasonType = requireNotNull(reasonType),
            reasonText = reasonText,
            status = requireNotNull(status),
            createdAt = requireNotNull(createdAt),
        )
        ReportSource.REVIEW -> UserReviewReport(
            reportId = requireNotNull(reportId),
            version = requireNotNull(version),
            targetUserId = requireNotNull(targetUserId),
            reporterUserId = requireNotNull(reporterUserId),
            reviewId = requireNotNull(reviewId),
            reasonType = requireNotNull(reasonType),
            reasonText = reasonText,
            status = requireNotNull(status),
            createdAt = requireNotNull(createdAt),
            externalEventId = requireNotNull(externalEventId),
        )
    }
}

fun UserReport.toEntity(): UserReportEntity = UserReportEntity().toEntity(this)
