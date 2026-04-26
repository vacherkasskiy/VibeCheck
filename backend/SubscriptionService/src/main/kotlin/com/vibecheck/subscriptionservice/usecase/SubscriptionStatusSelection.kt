package com.vibecheck.subscriptionservice.usecase

import com.vibecheck.subscriptionservice.domain.SubscriptionStatus
import com.vibecheck.subscriptionservice.usecase.storage.SubscriptionStorage
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class SubscriptionStatusSelection(
    private val subscriptionStorage: SubscriptionStorage
) {
    fun select(authorId: UUID, subscriberId: UUID): SubscriptionStatus =
        takeIf { subscriptionStorage.isExisted(subscriberId = subscriberId, authorId = authorId) }
            ?.let { SubscriptionStatus.ACTIVE }
            ?: SubscriptionStatus.INACTIVE
}