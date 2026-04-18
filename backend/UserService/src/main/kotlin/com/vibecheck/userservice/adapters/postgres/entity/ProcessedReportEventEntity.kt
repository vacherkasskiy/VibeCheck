package com.vibecheck.userservice.adapters.postgres.entity

import com.vibecheck.userservice.domain.report.ProcessedReportEvent
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "processed_report_events")
class ProcessedReportEventEntity {
    @Id
    @Column(name = "event_id", nullable = false, length = 255)
    var eventId: String? = null

    @Column(name = "report_id", nullable = false, length = 255)
    var reportId: String? = null

    @Column(name = "processed_at", nullable = false)
    var processedAt: Instant? = null

    fun toEntity(domain: ProcessedReportEvent): ProcessedReportEventEntity = apply {
        eventId = domain.eventId
        reportId = domain.reportId
        processedAt = domain.processedAt
    }

    fun toDomain(): ProcessedReportEvent = ProcessedReportEvent(
        eventId = requireNotNull(eventId),
        reportId = requireNotNull(reportId),
        processedAt = requireNotNull(processedAt),
    )
}

fun ProcessedReportEvent.toEntity(): ProcessedReportEventEntity = ProcessedReportEventEntity().toEntity(this)
