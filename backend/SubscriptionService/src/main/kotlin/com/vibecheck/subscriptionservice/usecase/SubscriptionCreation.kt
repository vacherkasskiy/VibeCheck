package com.vibecheck.subscriptionservice.usecase

import com.vibecheck.subscriptionservice.domain.Subscription
import com.vibecheck.subscriptionservice.domain.event.SubscriptionIsCreatedEvent
import com.vibecheck.subscriptionservice.domain.exception.BadRequestException
import com.vibecheck.subscriptionservice.usecase.cache.FollowingCache
import com.vibecheck.subscriptionservice.usecase.cache.SubscriberCache
import com.vibecheck.subscriptionservice.usecase.storage.SubscriptionStorage
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.time.Clock
import java.util.UUID

@Service
class SubscriptionCreation(
    private val subscriptionStorage: SubscriptionStorage,
    private val subscriberCache: SubscriberCache,
    private val followingCache: FollowingCache,
    private val transactionTemplate: TransactionTemplate,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val clock: Clock
) {
    fun create(subscriberId: UUID, authorId: UUID) {
        if (subscriberId == authorId) {
            throw BadRequestException("Followee ID $subscriberId cannot create a subscription on himself")
        }

        if (subscriptionStorage.isExisted(subscriberId, authorId)) {
            throw BadRequestException("Subscription for followee $subscriberId and follower $authorId already exists")
        }

        transactionTemplate.execute {
            subscriptionStorage.create(
                Subscription(authorId = authorId, subscriberId = subscriberId, createdAt = clock.instant())
            )

            applicationEventPublisher.publishEvent(SubscriptionIsCreatedEvent(
                authorId = authorId,
                subscriberId = subscriberId
            ))
        }

        subscriberCache.add(authorId, subscriberId)
        followingCache.add(authorId, subscriberId)
    }
}