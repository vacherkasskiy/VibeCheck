package com.vibecheck.subscriptionservice.adapters.postgres

import com.vibecheck.subscriptionservice.adapters.postgres.entity.toDto
import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.usecase.storage.UserActivityStorage
import org.jooq.DSLContext
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Repository
class UserActivityStorageImpl(
    private val dsl: DSLContext,
    private val mapper: PostgresRecordMapper,
) : UserActivityStorage {

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(activity: UserActivity) {
        dsl.insertInto(UserActivityTable.TABLE)
            .set(UserActivityTable.ID, activity.id)
            .set(UserActivityTable.USER_ID, activity.userId)
            .set(UserActivityTable.ACTIVITY_INFO, mapper.toJsonb(activity.activityInfo.toDto()))
            .set(UserActivityTable.CREATED_AT, activity.createdAt)
            .set(UserActivityTable.EXPIRED_AT, activity.expiredAt)
            .execute()
    }

    override fun getByIds(ids: Collection<UUID>): List<UserActivity> {
        if (ids.isEmpty()) {
            return emptyList()
        }

        return dsl.selectFrom(UserActivityTable.TABLE)
            .where(UserActivityTable.ID.`in`(ids))
            .fetch(mapper::toUserActivity)
    }

    override fun getLatestByUserId(userId: UUID, limit: Int): List<UserActivity> =
        dsl.selectFrom(UserActivityTable.TABLE)
            .where(UserActivityTable.USER_ID.eq(userId))
            .orderBy(UserActivityTable.CREATED_AT.desc(), UserActivityTable.ID.desc())
            .limit(limit)
            .fetch(mapper::toUserActivity)

    override fun getFeedPage(
        authorIds: Collection<UUID>,
        limit: Int,
        cursorCreatedAt: Instant?,
        cursorActivityId: UUID?,
    ): List<UserActivity> {
        if (authorIds.isEmpty() || limit <= 0) {
            return emptyList()
        }

        val query = dsl.selectFrom(UserActivityTable.TABLE)
            .where(UserActivityTable.USER_ID.`in`(authorIds))
            .apply {
                if (cursorCreatedAt != null && cursorActivityId != null) {
                    and(
                        UserActivityTable.CREATED_AT.lt(cursorCreatedAt)
                            .or(UserActivityTable.CREATED_AT.eq(cursorCreatedAt).and(UserActivityTable.ID.lt(cursorActivityId)))
                    )
                }
            }
            .orderBy(UserActivityTable.CREATED_AT.desc(), UserActivityTable.ID.desc())
            .limit(limit)

        return query.fetch(mapper::toUserActivity)
    }
}
