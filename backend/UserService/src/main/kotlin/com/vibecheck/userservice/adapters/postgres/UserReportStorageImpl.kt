package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.domain.exception.OptimisticLockException
import com.vibecheck.userservice.domain.report.UserReport
import com.vibecheck.userservice.domain.report.UserReviewReport
import com.vibecheck.userservice.usecase.storage.UserReportStorage
import org.jooq.DSLContext
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@Repository
class UserReportStorageImpl(
    private val dsl: DSLContext,
    private val mapper: PostgresRecordMapper,
) : UserReportStorage {
    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(report: UserReport): UserReport =
        dsl.insertInto(UserReportTable.TABLE)
            .set(UserReportTable.REPORT_ID, report.reportId)
            .set(UserReportTable.VERSION, report.version)
            .set(UserReportTable.SOURCE, report.source.name)
            .set(UserReportTable.TARGET_USER_ID, report.targetUserId)
            .set(UserReportTable.REPORTER_USER_ID, report.reporterUserId)
            .set(UserReportTable.REVIEW_ID, report.reviewIdOrNull())
            .set(UserReportTable.REASON_TYPE, report.reasonType.name)
            .set(UserReportTable.REASON_TEXT, report.reasonText)
            .set(UserReportTable.STATUS, report.status.name)
            .set(UserReportTable.CREATED_AT, report.createdAt)
            .set(UserReportTable.EXTERNAL_EVENT_ID, report.externalEventIdOrNull())
            .returning(
                USER_REPORT_FIELDS
            )
            .fetchOne(mapper::toUserReport)
            ?: error("Failed to create report ${report.reportId}")

    override fun findById(reportId: String): UserReport? =
        dsl.selectFrom(UserReportTable.TABLE)
            .where(UserReportTable.REPORT_ID.eq(reportId))
            .fetchOne(mapper::toUserReport)

    @Transactional(propagation = Propagation.MANDATORY)
    override fun update(report: UserReport): UserReport {
        return dsl.update(UserReportTable.TABLE)
            .set(UserReportTable.VERSION, report.version + 1)
            .set(UserReportTable.SOURCE, report.source.name)
            .set(UserReportTable.TARGET_USER_ID, report.targetUserId)
            .set(UserReportTable.REPORTER_USER_ID, report.reporterUserId)
            .set(UserReportTable.REVIEW_ID, report.reviewIdOrNull())
            .set(UserReportTable.REASON_TYPE, report.reasonType.name)
            .set(UserReportTable.REASON_TEXT, report.reasonText)
            .set(UserReportTable.STATUS, report.status.name)
            .set(UserReportTable.CREATED_AT, report.createdAt)
            .set(UserReportTable.EXTERNAL_EVENT_ID, report.externalEventIdOrNull())
            .where(UserReportTable.REPORT_ID.eq(report.reportId))
            .and(UserReportTable.VERSION.eq(report.version))
            .returning(
                USER_REPORT_FIELDS
            )
            .fetchOne(mapper::toUserReport)
            ?: throw OptimisticLockException("Report ${report.reportId} has been modified concurrently")
    }

    override fun findAll(pageable: Pageable): Page<UserReport> {
        val total = dsl.fetchCount(UserReportTable.TABLE)
        val content = dsl.selectFrom(UserReportTable.TABLE)
            .orderBy(UserReportTable.CREATED_AT.desc(), UserReportTable.REPORT_ID.asc())
            .limit(pageable.pageSize)
            .offset(pageable.offset.toInt())
            .fetch(mapper::toUserReport)

        return PageImpl(content, pageable, total.toLong())
    }

    private fun UserReport.reviewIdOrNull(): String? = when (this) {
        is UserReviewReport -> reviewId
        else -> null
    }

    private fun UserReport.externalEventIdOrNull(): String? = when (this) {
        is UserReviewReport -> externalEventId
        else -> null
    }

    private companion object {
        private val USER_REPORT_FIELDS = listOf(
            UserReportTable.REPORT_ID,
            UserReportTable.VERSION,
            UserReportTable.SOURCE,
            UserReportTable.TARGET_USER_ID,
            UserReportTable.REPORTER_USER_ID,
            UserReportTable.REVIEW_ID,
            UserReportTable.REASON_TYPE,
            UserReportTable.REASON_TEXT,
            UserReportTable.STATUS,
            UserReportTable.CREATED_AT,
            UserReportTable.EXTERNAL_EVENT_ID,
        )
    }
}
