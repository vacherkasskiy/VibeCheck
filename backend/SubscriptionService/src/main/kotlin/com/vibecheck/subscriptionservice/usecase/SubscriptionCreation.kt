package com.vibecheck.subscriptionservice.usecase

import com.vibecheck.subscriptionservice.domain.Subscription
import com.vibecheck.subscriptionservice.domain.event.SubscriptionIsCreatedEvent
import com.vibecheck.subscriptionservice.domain.exception.BadRequestException
import com.vibecheck.subscriptionservice.usecase.cache.FollowingCache
import com.vibecheck.subscriptionservice.usecase.cache.HeavyAuthorCache
import com.vibecheck.subscriptionservice.usecase.cache.SubscriberFeedCache
import com.vibecheck.subscriptionservice.usecase.storage.SubscriptionStorage
import com.vibecheck.subscriptionservice.usecase.storage.UserActivityStorage
import org.springframework.beans.factory.annotation.Value
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.time.Clock
import java.util.UUID

@Service
class SubscriptionCreation(
    private val subscriptionStorage: SubscriptionStorage,
    private val followingCache: FollowingCache,
    private val subscriberFeedCache: SubscriberFeedCache,
    private val heavyAuthorCache: HeavyAuthorCache,
    private val userActivityStorage: UserActivityStorage,
    @Value("\${app.feed.hot-size:30}")
    private val hotSize: Int,
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

        val createdAt = clock.instant()

        try {
            transactionTemplate.execute {
                subscriptionStorage.create(
                    Subscription(authorId = authorId, subscriberId = subscriberId, createdAt = createdAt)
                )

                applicationEventPublisher.publishEvent(SubscriptionIsCreatedEvent(
                    authorId = authorId,
                    subscriberId = subscriberId,
                    createdAt = createdAt,
                ))
            }
        } catch (_: DataIntegrityViolationException) {
            throw BadRequestException("Subscription for followee $subscriberId and follower $authorId already exists")
        }

        followingCache.add(authorId = authorId, subscriberId = subscriberId)

        if (!heavyAuthorCache.isHeavy(authorId)) {
            subscriberFeedCache.addAll(subscriberId, userActivityStorage.getLatestByUserId(authorId, hotSize))
        }
    }
}
