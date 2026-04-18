package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.report.ReportReasonType
import com.vibecheck.userservice.domain.report.ReportSource
import com.vibecheck.userservice.domain.report.ReportStatus
import com.vibecheck.userservice.domain.report.UserReviewReport
import com.vibecheck.userservice.usecase.storage.UserReportStorage
import com.vibecheck.userservice.usecase.storage.UserStorage
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class InternalReportsSelection(
    private val userReportStorage: UserReportStorage,
    private val userStorage: UserStorage,
) {
    fun select(page: Int, size: Int): InternalReportsPage {
        val pageable = PageRequest.of(page, size)
        val reportsPage = userReportStorage.findAll(pageable)
        val usersById = userStorage.findAllByIds(reportsPage.content.map { it.targetUserId }.toSet())
            .associateBy { it.id }

        return InternalReportsPage(
            items = reportsPage.content.map { report ->
                InternalReportItem(
                    reportId = report.reportId,
                    source = report.source,
                    targetUserId = report.targetUserId,
                    reporterUserId = report.reporterUserId,
                    reviewId = (report as? UserReviewReport)?.reviewId,
                    reasonType = report.reasonType,
                    reasonText = report.reasonText,
                    status = report.status,
                    createdAt = report.createdAt,
                    externalEventId = (report as? UserReviewReport)?.externalEventId,
                    targetUserBanned = usersById[report.targetUserId]?.isBanned ?: false,
                )
            },
            page = reportsPage.number,
            size = reportsPage.size,
            totalElements = reportsPage.totalElements,
            totalPages = reportsPage.totalPages,
        )
    }
}

data class InternalReportsPage(
    val items: List<InternalReportItem>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
)

data class InternalReportItem(
    val reportId: String,
    val source: ReportSource,
    val targetUserId: UUID,
    val reporterUserId: UUID,
    val reviewId: String?,
    val reasonType: ReportReasonType,
    val reasonText: String?,
    val status: ReportStatus,
    val createdAt: Instant,
    val externalEventId: String?,
    val targetUserBanned: Boolean,
)
