package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.domain.exception.BadRequestException
import com.vibecheck.userservice.domain.exception.DuplicateProcessedEventException
import com.vibecheck.userservice.domain.report.ProcessedReportEvent
import com.vibecheck.userservice.usecase.storage.ProcessedReportEventStorage
import org.jooq.DSLContext
import org.jooq.exception.IntegrityConstraintViolationException
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@Repository
class ProcessedReportEventStorageImpl(
    private val dsl: DSLContext,
    private val mapper: PostgresRecordMapper,
) : ProcessedReportEventStorage {
    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(event: ProcessedReportEvent): ProcessedReportEvent {
        try {
            return dsl.insertInto(ProcessedReportEventTable.TABLE)
                .set(ProcessedReportEventTable.EVENT_ID, event.eventId)
                .set(ProcessedReportEventTable.REPORT_ID, event.reportId)
                .set(ProcessedReportEventTable.PROCESSED_AT, event.processedAt)
                .returning(
                    ProcessedReportEventTable.EVENT_ID,
                    ProcessedReportEventTable.REPORT_ID,
                    ProcessedReportEventTable.PROCESSED_AT,
                )
                .fetchOne(mapper::toProcessedReportEvent)
                ?: error("Failed to insert processed report event ${event.eventId}")
        } catch (_: IntegrityConstraintViolationException) {
            throw BadRequestException("Processed event ${event.eventId} already exists")
        }
    }
}
