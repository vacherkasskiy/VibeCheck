package com.vibecheck.subscriptionservice.adapters.postgres

import com.vibecheck.subscriptionservice.adapters.postgres.entity.SubscriptionEntity
import com.vibecheck.subscriptionservice.adapters.postgres.entity.toEntity
import com.vibecheck.subscriptionservice.adapters.postgres.repository.SubscriptionRepository
import com.vibecheck.subscriptionservice.domain.Subscription
import com.vibecheck.subscriptionservice.usecase.storage.SubscriptionStorage
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Repository
class SubscriptionStorageImpl(
    private val subscriptionRepository: SubscriptionRepository
) : SubscriptionStorage {
    override fun isExisted(subscriberId: UUID, authorId: UUID): Boolean =
        subscriptionRepository.existsById(SubscriptionEntity.SubscriptionId(authorId, subscriberId))

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(subscription: Subscription) {
        subscriptionRepository.saveAndFlush(subscription.toEntity())
    }

    @Transactional(propagation = Propagation.MANDATORY)
    override fun deleteById(authorId: UUID, subscriberId: UUID) {
        subscriptionRepository.deleteById(SubscriptionEntity.SubscriptionId(authorId, subscriberId))
    }
}