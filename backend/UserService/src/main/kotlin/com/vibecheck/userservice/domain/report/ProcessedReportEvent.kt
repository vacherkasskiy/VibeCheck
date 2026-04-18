package com.vibecheck.userservice.domain.report

import java.time.Instant

data class ProcessedReportEvent(
    val eventId: String,
    val reportId: String,
    val processedAt: Instant,
) {
    companion object {
        fun new(eventId: String, reportId: String, processedAt: Instant): ProcessedReportEvent =
            ProcessedReportEvent(eventId = eventId, reportId = reportId, processedAt = processedAt)
    }
}
