package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.report.UserReport
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

interface UserReportStorage {
    fun create(report: UserReport): UserReport

    fun findAll(pageable: Pageable): Page<UserReport>
}
