package com.vibecheck.subscriptionservice.usecase

import com.vibecheck.subscriptionservice.usecase.cache.SusbcriptionCache
import com.vibecheck.subscriptionservice.usecase.storage.SubscriptionStorage
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.util.UUID

@Service
class SubscriptionDeletion(
    private val subscriptionStorage: SubscriptionStorage,
    private val susbcriptionCache: SusbcriptionCache,
    private val transactionTemplate: TransactionTemplate,
) {
    fun delete(subscriberId: UUID, authorId: UUID) {
        transactionTemplate.execute {
            subscriptionStorage.deleteById(authorId = authorId, subscriberId = subscriberId)
        }
        susbcriptionCache.delete(authorId = authorId, subscriberId = subscriberId)
    }
}
