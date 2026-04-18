package com.vibecheck.userservice.adapters.rest.dto

import com.vibecheck.userservice.domain.report.ReportReasonType
import jakarta.validation.constraints.Size
import java.util.UUID

data class CreateUserReportDto(
    val reportId: String,
    val reasonType: ReportReasonType,
    @field:Size(max = 1000)
    val reasonText: String?,
)
