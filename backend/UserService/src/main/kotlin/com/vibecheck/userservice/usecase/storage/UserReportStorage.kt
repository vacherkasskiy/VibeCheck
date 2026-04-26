package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.domain.report.UserReport
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

interface UserReportStorage {
    fun create(report: UserReport): UserReport
    fun findById(reportId: String): UserReport?
    fun findByIdOrThrow(reportId: String): UserReport =
        findById(reportId) ?: throw NotFoundException("Report $reportId not found")
    fun update(report: UserReport): UserReport
    fun findAll(pageable: Pageable): Page<UserReport>
}
