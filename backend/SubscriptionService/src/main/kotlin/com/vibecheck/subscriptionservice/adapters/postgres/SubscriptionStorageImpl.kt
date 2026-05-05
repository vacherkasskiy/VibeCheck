package com.vibecheck.subscriptionservice.adapters.postgres

import com.vibecheck.subscriptionservice.domain.Subscription
import com.vibecheck.subscriptionservice.usecase.storage.SubscriptionStorage
import org.jooq.DSLContext
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Repository
class SubscriptionStorageImpl(
    private val dsl: DSLContext,
) : SubscriptionStorage {
    override fun isExisted(subscriberId: UUID, authorId: UUID): Boolean =
        dsl.fetchExists(
            dsl.selectOne()
                .from(SubscriptionsTable.TABLE)
                .where(SubscriptionsTable.AUTHOR_ID.eq(authorId))
                .and(SubscriptionsTable.SUBSCRIBER_ID.eq(subscriberId))
        )

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(subscription: Subscription) {
        dsl.insertInto(SubscriptionsTable.TABLE)
            .set(SubscriptionsTable.AUTHOR_ID, subscription.authorId)
            .set(SubscriptionsTable.SUBSCRIBER_ID, subscription.subscriberId)
            .set(SubscriptionsTable.CREATED_AT, subscription.createdAt)
            .execute()
    }

    @Transactional(propagation = Propagation.MANDATORY)
    override fun deleteById(authorId: UUID, subscriberId: UUID) {
        dsl.deleteFrom(SubscriptionsTable.TABLE)
            .where(SubscriptionsTable.AUTHOR_ID.eq(authorId))
            .and(SubscriptionsTable.SUBSCRIBER_ID.eq(subscriberId))
            .execute()
    }

    override fun findAuthorIdsBySubscriberId(subscriberId: UUID): List<UUID> =
        dsl.select(SubscriptionsTable.AUTHOR_ID)
            .from(SubscriptionsTable.TABLE)
            .where(SubscriptionsTable.SUBSCRIBER_ID.eq(subscriberId))
            .fetch(SubscriptionsTable.AUTHOR_ID)

    override fun findSubscriberIdsByAuthorId(authorId: UUID): List<UUID> =
        dsl.select(SubscriptionsTable.SUBSCRIBER_ID)
            .from(SubscriptionsTable.TABLE)
            .where(SubscriptionsTable.AUTHOR_ID.eq(authorId))
            .fetch(SubscriptionsTable.SUBSCRIBER_ID)

    override fun countSubscribersByAuthorId(): Map<UUID, Long> =
        dsl.select(SubscriptionsTable.AUTHOR_ID, org.jooq.impl.DSL.count())
            .from(SubscriptionsTable.TABLE)
            .groupBy(SubscriptionsTable.AUTHOR_ID)
            .fetch()
            .associate { record ->
                requireNotNull(record.get(SubscriptionsTable.AUTHOR_ID)) to
                    requireNotNull(record.get(org.jooq.impl.DSL.count())).toLong()
            }
}
