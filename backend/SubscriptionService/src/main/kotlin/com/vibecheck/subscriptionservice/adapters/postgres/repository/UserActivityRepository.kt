package com.vibecheck.subscriptionservice.adapters.postgres.repository

import com.vibecheck.subscriptionservice.adapters.postgres.entity.UserActivityEntity
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface UserActivityRepository : JpaRepository<UserActivityEntity, UUID> {
    fun findAllByUserIdOrderByCreatedAtDescIdDesc(userId: UUID, pageable: Pageable): List<UserActivityEntity>

    fun findAllByUserIdInOrderByCreatedAtDescIdDesc(userIds: Collection<UUID>, pageable: Pageable): List<UserActivityEntity>

    @Query(
        value = """
        select *
        from user_activity
        where user_id in (:userIds)
          and (created_at < :createdAt or (created_at = :createdAt and id < :activityId))
        order by created_at desc, id desc
        """,
        nativeQuery = true
    )
    fun findFeedPageBeforeCursor(
        @Param("userIds") userIds: Collection<UUID>,
        @Param("createdAt") createdAt: Instant,
        @Param("activityId") activityId: UUID,
        pageable: Pageable,
    ): List<UserActivityEntity>
}
