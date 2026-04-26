package com.vibecheck.subscriptionservice.usecase

import com.vibecheck.subscriptionservice.usecase.cache.HeavyAuthorCache
import com.vibecheck.subscriptionservice.usecase.storage.SubscriptionStorage
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service

@Service
class HeavyAuthorModeRefresh(
    private val subscriptionStorage: SubscriptionStorage,
    private val heavyAuthorCache: HeavyAuthorCache,
    @Value("\${app.feed.heavy-author-enter-threshold:1000}")
    private val enterThreshold: Long,
    @Value("\${app.feed.heavy-author-exit-threshold:800}")
    private val exitThreshold: Long,
) {
    @EventListener(ApplicationReadyEvent::class)
    fun warmUp() {
        refresh()
    }

    @Scheduled(fixedDelayString = "\${app.feed.heavy-author-refresh-delay:PT5M}")
    fun refresh() {
        val currentHeavyAuthors = heavyAuthorCache.getAll()
        val subscribersCountByAuthor = subscriptionStorage.countSubscribersByAuthorId()

        val nextHeavyAuthors = subscribersCountByAuthor
            .filter { (authorId, subscribersCount) ->
                subscribersCount >= enterThreshold ||
                    (authorId in currentHeavyAuthors && subscribersCount >= exitThreshold)
            }
            .keys
            .toSet()

        heavyAuthorCache.replaceAll(nextHeavyAuthors)
    }
}
