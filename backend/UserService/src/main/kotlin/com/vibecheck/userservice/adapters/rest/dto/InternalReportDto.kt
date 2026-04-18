package com.vibecheck.userservice.adapters.rest.dto

import com.vibecheck.userservice.domain.report.ReportReasonType
import com.vibecheck.userservice.domain.report.ReportSource
import com.vibecheck.userservice.domain.report.ReportStatus
import com.vibecheck.userservice.usecase.InternalReportItem
import com.vibecheck.userservice.usecase.InternalReportsPage
import java.time.Instant
import java.util.UUID

data class InternalReportDto(
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

data class InternalReportsPageDto(
    val items: List<InternalReportDto>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
)

fun InternalReportItem.toDto(): InternalReportDto = InternalReportDto(
    reportId = reportId,
    source = source,
    targetUserId = targetUserId,
    reporterUserId = reporterUserId,
    reviewId = reviewId,
    reasonType = reasonType,
    reasonText = reasonText,
    status = status,
    createdAt = createdAt,
    externalEventId = externalEventId,
    targetUserBanned = targetUserBanned,
)

fun InternalReportsPage.toDto(): InternalReportsPageDto = InternalReportsPageDto(
    items = items.map { it.toDto() },
    page = page,
    size = size,
    totalElements = totalElements,
    totalPages = totalPages,
)
