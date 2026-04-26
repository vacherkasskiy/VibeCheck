package com.vibecheck.subscriptionservice.usecase.storage

import com.vibecheck.subscriptionservice.domain.Subscription
import java.util.UUID

interface SubscriptionStorage {
    fun isExisted(subscriberId: UUID, authorId: UUID): Boolean
    fun create(subscription: Subscription)
    fun deleteById(authorId: UUID, subscriberId: UUID)
    fun findAuthorIdsBySubscriberId(subscriberId: UUID): List<UUID>
    fun findSubscriberIdsByAuthorId(authorId: UUID): List<UUID>
    fun countSubscribersByAuthorId(): Map<UUID, Long>
}
