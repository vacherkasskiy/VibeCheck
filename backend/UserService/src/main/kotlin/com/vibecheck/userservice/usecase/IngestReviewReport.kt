package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.exception.DuplicateProcessedEventException
import com.vibecheck.userservice.domain.report.ProcessedReportEvent
import com.vibecheck.userservice.domain.report.ReportReasonType
import com.vibecheck.userservice.domain.report.UserReport
import com.vibecheck.userservice.usecase.storage.ProcessedReportEventStorage
import com.vibecheck.userservice.usecase.storage.UserReportStorage
import com.google.protobuf.Timestamp
import com.vibecheck.userservice.domain.report.UserReviewReport
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import reports.ReportEvent
import java.time.Clock
import java.time.Instant
import java.util.UUID

@Service
class IngestReviewReport(
    private val processedReportEventStorage: ProcessedReportEventStorage,
    private val userReportStorage: UserReportStorage,
    private val transactionTemplate: TransactionTemplate,
    private val clock: Clock,
) {
    fun ingest(event: ReportEvent.ReviewReportedEvent): Boolean {
        val eventId = event.meta.eventId
        val report = UserReviewReport.new(
            reportId = event.reportId,
            targetUserId = UUID.fromString(event.targetUserId),
            reporterUserId = UUID.fromString(event.reporterUserId),
            reviewId = event.reviewId,
            reasonType = event.reasonType.toDomain(),
            reasonText = if (event.hasReasonText()) event.reasonText else null,
            createdAt = event.createdAt.toInstant(),
            externalEventId = eventId,
        )

        return try {
            transactionTemplate.execute {
                processedReportEventStorage.create(
                    ProcessedReportEvent.new(
                        eventId = eventId,
                        reportId = report.reportId,
                        processedAt = clock.instant(),
                    )
                )
                userReportStorage.create(report)
            }
            true
        } catch (_: DuplicateProcessedEventException) {
            false
        }
    }

    private fun Timestamp.toInstant(): Instant =
        Instant.ofEpochSecond(seconds, nanos.toLong())

    private fun ReportEvent.ReportReasonType.toDomain(): ReportReasonType = when (this) {
        ReportEvent.ReportReasonType.SPAM_OR_ADVERTISEMENT -> ReportReasonType.SPAM_OR_ADVERTISEMENT
        ReportEvent.ReportReasonType.FRAUD_OR_EXTORTION -> ReportReasonType.FRAUD_OR_EXTORTION
        ReportEvent.ReportReasonType.HARASSMENT_OR_INSULT -> ReportReasonType.HARASSMENT_OR_INSULT
        ReportEvent.ReportReasonType.HATE_SPEECH -> ReportReasonType.HATE_SPEECH
        ReportEvent.ReportReasonType.THREAT_OR_VIOLENCE -> ReportReasonType.THREAT_OR_VIOLENCE
        ReportEvent.ReportReasonType.PERSONAL_DATA -> ReportReasonType.PERSONAL_DATA
        ReportEvent.ReportReasonType.MISLEADING_INFORMATION -> ReportReasonType.MISLEADING_INFORMATION
        ReportEvent.ReportReasonType.OFF_TOPIC_OR_LOW_QUALITY -> ReportReasonType.OFF_TOPIC_OR_LOW_QUALITY
        ReportEvent.ReportReasonType.OTHER -> ReportReasonType.OTHER
        ReportEvent.ReportReasonType.REPORT_REASON_UNSPECIFIED,
        ReportEvent.ReportReasonType.UNRECOGNIZED -> throw IllegalArgumentException("Unsupported report reason type: $this")
    }
}
