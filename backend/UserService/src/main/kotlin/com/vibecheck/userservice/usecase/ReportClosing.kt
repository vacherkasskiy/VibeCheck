package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.report.ReportStatus
import com.vibecheck.userservice.usecase.storage.UserReportStorage
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate

@Service
class ReportClosing(
    private val userReportStorage: UserReportStorage,
    private val transactionTemplate: TransactionTemplate,
) {
    fun close(reportId: String) {
        val report = userReportStorage.findByIdOrThrow(reportId)
        if (report.status == ReportStatus.CLOSED) {
            return
        }

        transactionTemplate.execute {
            userReportStorage.update(report.close())
        }
    }
}
