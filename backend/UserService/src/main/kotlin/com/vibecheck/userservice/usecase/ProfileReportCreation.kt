package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.exception.BadRequestException
import com.vibecheck.userservice.domain.report.ReportReasonType
import com.vibecheck.userservice.domain.report.UserProfileReport
import com.vibecheck.userservice.domain.report.UserReport
import com.vibecheck.userservice.usecase.storage.UserReportStorage
import com.vibecheck.userservice.usecase.storage.UserStorage
import com.vibecheck.userservice.utils.UuidGenerator
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.time.Clock
import java.util.UUID

@Service
class ProfileReportCreation(
    private val userStorage: UserStorage,
    private val userReportStorage: UserReportStorage,
    private val transactionTemplate: TransactionTemplate,
    private val clock: Clock,
) {
    fun create(
        targetUserId: UUID,
        reporterUserId: UUID,
        reportId: String,
        reasonType: ReportReasonType,
        reasonText: String?,
    ) {
        if (targetUserId == reporterUserId) {
            throw BadRequestException("User cannot report their own profile")
        }

        if (!userStorage.existsById(targetUserId)) {
            throw BadRequestException("User $targetUserId is not exists")
        }

        if (!userStorage.existsById(reporterUserId)) {
            throw BadRequestException("User $reporterUserId is not exists")
        }

        val report = UserProfileReport.new(
            reportId = reportId,
            targetUserId = targetUserId,
            reporterUserId = reporterUserId,
            reasonType = reasonType,
            reasonText = reasonText,
            createdAt = clock.instant(),
        )

        transactionTemplate.execute {
            userReportStorage.create(report)
        }
    }
}
