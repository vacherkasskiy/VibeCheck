package com.vibecheck.subscriptionservice.usecase.storage

import com.vibecheck.subscriptionservice.domain.Subscription
import java.util.UUID

interface SubscriptionStorage {
    fun isExisted(subscriberId: UUID, authorId: UUID): Boolean
    fun create(subscription: Subscription)
    fun deleteById(authorId: UUID, subscriberId: UUID)
}