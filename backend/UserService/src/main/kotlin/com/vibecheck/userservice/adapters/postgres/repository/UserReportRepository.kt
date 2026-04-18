package com.vibecheck.userservice.adapters.postgres.repository

import com.vibecheck.userservice.adapters.postgres.entity.UserReportEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface UserReportRepository : JpaRepository<UserReportEntity, String> {
    fun findAllByOrderByCreatedAtDesc(pageable: Pageable): Page<UserReportEntity>
}
