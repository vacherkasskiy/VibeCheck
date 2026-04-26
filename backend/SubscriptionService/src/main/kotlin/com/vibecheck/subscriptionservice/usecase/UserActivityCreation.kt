package com.vibecheck.subscriptionservice.usecase

import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.domain.event.UserActivityIsCreatedEvent
import com.vibecheck.subscriptionservice.usecase.cache.ActivityCache
import com.vibecheck.subscriptionservice.usecase.cache.HeavyAuthorCache
import com.vibecheck.subscriptionservice.usecase.cache.SubscriberFeedCache
import com.vibecheck.subscriptionservice.usecase.cache.UserActivityCache
import com.vibecheck.subscriptionservice.usecase.storage.SubscriptionStorage
import com.vibecheck.subscriptionservice.usecase.storage.UserActivityStorage
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate

@Service
class UserActivityCreation(
    private val userActivityStorage: UserActivityStorage,
    private val userActivityCache: UserActivityCache,
    private val activityCache: ActivityCache,
    private val subscriberFeedCache: SubscriberFeedCache,
    private val heavyAuthorCache: HeavyAuthorCache,
    private val subscriptionStorage: SubscriptionStorage,
    private val transactionTemplate: TransactionTemplate,
    private val applicationEventPublisher: ApplicationEventPublisher,

    ) {
    fun create(userActivity: UserActivity) {
        transactionTemplate.execute {
            userActivityStorage.create(userActivity)

            applicationEventPublisher.publishEvent(UserActivityIsCreatedEvent(
                userId = userActivity.userId,
                activityInfo = userActivity.activityInfo,
                expiredAt = userActivity.expiredAt,
            ))
        }

        activityCache.add(userActivity)
        userActivityCache.add(userActivity.userId, userActivity.id, userActivity.createdAt)

        if (heavyAuthorCache.isHeavy(userActivity.userId)) {
            return
        }

        subscriptionStorage.findSubscriberIdsByAuthorId(userActivity.userId)
            .forEach { subscriberId ->
                subscriberFeedCache.add(subscriberId, userActivity.id, userActivity.createdAt)
            }
    }
}
