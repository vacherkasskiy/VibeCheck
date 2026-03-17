package com.vibecheck.subscriptionservice.usecase

import com.vibecheck.subscriptionservice.domain.SubscriptionStatus
import com.vibecheck.subscriptionservice.usecase.storage.SubscriptionStorage
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class SubscriptionStatusSelection(
    private val subscriptionStorage: SubscriptionStorage
) {
    fun select(followeeId: UUID, followerId: UUID): SubscriptionStatus =
        takeIf { subscriptionStorage.isExisted(followeeId, followerId) }
            ?.let { SubscriptionStatus.ACTIVE }
            ?: SubscriptionStatus.INACTIVE
}