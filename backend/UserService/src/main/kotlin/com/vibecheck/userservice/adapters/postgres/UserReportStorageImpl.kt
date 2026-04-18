package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.entity.toEntity
import com.vibecheck.userservice.adapters.postgres.repository.UserReportRepository
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.domain.report.UserReport
import com.vibecheck.userservice.usecase.storage.UserReportStorage
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import kotlin.jvm.optionals.getOrNull

@Repository
class UserReportStorageImpl(
    private val userReportRepository: UserReportRepository,
) : UserReportStorage {
    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(report: UserReport): UserReport =
        userReportRepository.saveAndFlush(report.toEntity()).toDomain()

    override fun findById(reportId: String): UserReport? =
        userReportRepository.findById(reportId)
            .getOrNull()
            ?.toDomain()

    @Transactional(propagation = Propagation.MANDATORY)
    override fun update(report: UserReport): UserReport {
        if (!userReportRepository.existsById(report.reportId)) {
            throw NotFoundException("Report ${report.reportId} not found")
        }

        return userReportRepository.saveAndFlush(report.toEntity()).toDomain()
    }

    override fun findAll(pageable: Pageable): Page<UserReport> =
        userReportRepository.findAllByOrderByCreatedAtDesc(pageable).map { it.toDomain() }
}
