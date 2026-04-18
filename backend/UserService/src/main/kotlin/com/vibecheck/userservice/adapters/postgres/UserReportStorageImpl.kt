package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.entity.toEntity
import com.vibecheck.userservice.adapters.postgres.repository.UserReportRepository
import com.vibecheck.userservice.domain.report.UserReport
import com.vibecheck.userservice.usecase.storage.UserReportStorage
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@Repository
class UserReportStorageImpl(
    private val userReportRepository: UserReportRepository,
) : UserReportStorage {
    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(report: UserReport): UserReport =
        userReportRepository.saveAndFlush(report.toEntity()).toDomain()

    override fun findAll(pageable: Pageable): Page<UserReport> =
        userReportRepository.findAllByOrderByCreatedAtDesc(pageable).map { it.toDomain() }
}
