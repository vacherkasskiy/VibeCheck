package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.entity.toEntity
import com.vibecheck.userservice.adapters.postgres.repository.ProcessedReportEventRepository
import com.vibecheck.userservice.domain.exception.DuplicateProcessedEventException
import com.vibecheck.userservice.domain.report.ProcessedReportEvent
import com.vibecheck.userservice.usecase.storage.ProcessedReportEventStorage
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@Repository
class ProcessedReportEventStorageImpl(
    private val processedReportEventRepository: ProcessedReportEventRepository,
) : ProcessedReportEventStorage {
    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(event: ProcessedReportEvent): ProcessedReportEvent {
        try {
            return processedReportEventRepository.saveAndFlush(event.toEntity()).toDomain()
        } catch (_: DataIntegrityViolationException) {
            throw DuplicateProcessedEventException("Processed event ${event.eventId} already exists")
        }
    }
}
