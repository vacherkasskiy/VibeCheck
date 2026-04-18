package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.report.ProcessedReportEvent

interface ProcessedReportEventStorage {
    fun create(event: ProcessedReportEvent): ProcessedReportEvent
}
