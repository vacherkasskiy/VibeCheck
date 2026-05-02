package com.vibecheck.subscriptionservice.adapters.postgres.entity

import com.vibecheck.subscriptionservice.domain.Subscription
import java.io.Serializable
import java.time.Instant
import java.util.UUID

class SubscriptionEntity {
    var id: SubscriptionId? = null

    var createdAt: Instant? = null

    data class SubscriptionId(
        val authorId: UUID? = null,
        val subscriberId: UUID? = null,
    ) : Serializable

    fun fill(domain: Subscription): SubscriptionEntity = apply {
        id = SubscriptionId(domain.authorId, domain.subscriberId)
        createdAt = domain.createdAt
    }
}

fun Subscription.toEntity(): SubscriptionEntity = SubscriptionEntity().fill(this)
