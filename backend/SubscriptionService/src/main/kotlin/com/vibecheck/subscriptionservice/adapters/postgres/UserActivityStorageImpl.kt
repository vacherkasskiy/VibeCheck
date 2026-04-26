package com.vibecheck.subscriptionservice.adapters.postgres

import com.vibecheck.subscriptionservice.adapters.postgres.entity.toDomain
import com.vibecheck.subscriptionservice.adapters.postgres.entity.toEntity
import com.vibecheck.subscriptionservice.adapters.postgres.repository.UserActivityRepository
import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.usecase.storage.UserActivityStorage
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Repository
class UserActivityStorageImpl(
    private val userActivityRepository: UserActivityRepository
) : UserActivityStorage {

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(activity: UserActivity) {
        userActivityRepository.save(activity.toEntity())
    }

    override fun getByIds(ids: Collection<UUID>): List<UserActivity> {
        if (ids.isEmpty()) {
            return emptyList()
        }

        return userActivityRepository.findAllById(ids).map { it.toDomain() }
    }

    override fun getLatestByUserId(userId: UUID, limit: Int): List<UserActivity> =
        userActivityRepository.findAllByUserIdOrderByCreatedAtDescIdDesc(userId, PageRequest.of(0, limit))
            .map { it.toDomain() }

    override fun getFeedPage(
        authorIds: Collection<UUID>,
        limit: Int,
        cursorCreatedAt: Instant?,
        cursorActivityId: UUID?,
    ): List<UserActivity> {
        if (authorIds.isEmpty() || limit <= 0) {
            return emptyList()
        }

        val pageRequest = PageRequest.of(0, limit)
        val activities = if (cursorCreatedAt != null && cursorActivityId != null) {
            userActivityRepository.findFeedPageBeforeCursor(authorIds, cursorCreatedAt, cursorActivityId, pageRequest)
        } else {
            userActivityRepository.findAllByUserIdInOrderByCreatedAtDescIdDesc(authorIds, pageRequest)
        }

        return activities.map { it.toDomain() }
    }
}
