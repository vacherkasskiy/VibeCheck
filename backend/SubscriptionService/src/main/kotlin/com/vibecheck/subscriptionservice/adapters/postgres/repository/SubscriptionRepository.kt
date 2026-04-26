package com.vibecheck.subscriptionservice.adapters.postgres.repository

import com.vibecheck.subscriptionservice.adapters.postgres.entity.SubscriptionEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface SubscriptionRepository : JpaRepository<SubscriptionEntity, SubscriptionEntity.SubscriptionId> {
    @Query(
        value = """
        select author_id
        from subscriptions
        where subscriber_id = :subscriberId
        """,
        nativeQuery = true
    )
    fun findAuthorIdsBySubscriberId(@Param("subscriberId") subscriberId: UUID): List<UUID>

    @Query(
        value = """
        select subscriber_id
        from subscriptions
        where author_id = :authorId
        """,
        nativeQuery = true
    )
    fun findSubscriberIdsByAuthorId(@Param("authorId") authorId: UUID): List<UUID>

    @Query(
        value = """
        select author_id as authorId, count(*) as subscribersCount
        from subscriptions
        group by author_id
        """,
        nativeQuery = true
    )
    fun countSubscribersByAuthorId(): List<AuthorSubscriberCountView>
}

interface AuthorSubscriberCountView {
    fun getAuthorId(): UUID
    fun getSubscribersCount(): Long
}
