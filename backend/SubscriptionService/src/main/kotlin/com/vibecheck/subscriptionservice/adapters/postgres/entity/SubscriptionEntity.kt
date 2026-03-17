package com.vibecheck.subscriptionservice.adapters.postgres.entity

import com.vibecheck.subscriptionservice.domain.Subscription
import jakarta.persistence.Column
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "subscriptions")
class SubscriptionEntity {
    @EmbeddedId
    var id: SubscriptionId? = null

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant? = null

    data class SubscriptionId(
        val authorId: UUID,
        val subscriberId: UUID,
    )

    fun fill(domain: Subscription): SubscriptionEntity = apply {
        id = SubscriptionId(domain.authorId, domain.subscriberId)
        createdAt = domain.createdAt
    }
}

fun Subscription.toEntity(): SubscriptionEntity = SubscriptionEntity().fill(this)