package com.vibecheck.userservice.adapters.postgres.repository

import com.vibecheck.userservice.adapters.postgres.entity.ProcessedReportEventEntity
import org.springframework.data.jpa.repository.JpaRepository

interface ProcessedReportEventRepository : JpaRepository<ProcessedReportEventEntity, String>
