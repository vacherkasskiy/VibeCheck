package com.vibecheck.subscriptionservice.adapters.rest

import com.vibecheck.subscriptionservice.adapters.rest.auth.AuthProvider
import com.vibecheck.subscriptionservice.adapters.rest.dto.FeedPageDto
import com.vibecheck.subscriptionservice.adapters.rest.dto.SubscriptionStatusDto
import com.vibecheck.subscriptionservice.adapters.rest.dto.toDto
import com.vibecheck.subscriptionservice.usecase.SubscriptionCreation
import com.vibecheck.subscriptionservice.usecase.SubscriptionDeletion
import com.vibecheck.subscriptionservice.usecase.SubscriptionFeedSelection
import com.vibecheck.subscriptionservice.usecase.SubscriptionStatusSelection
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
class SubscriptionController(
    private val subscriptionCreation: SubscriptionCreation,
    private val subscriptionDeletion: SubscriptionDeletion,
    private val subscriptionStatusSelection: SubscriptionStatusSelection,
    private val subscriptionFeedSelection: SubscriptionFeedSelection,
    private val authProvider: AuthProvider
) {
    @PostMapping("/users/{userId}/subscriptions")
    fun create(@PathVariable authorId: UUID) {
        subscriptionCreation.create(
            authProvider.getUserId(),
            authorId
        )
    }

    @DeleteMapping("/users/{userId}/subscriptions")
    fun delete(@PathVariable authorId: UUID) {
        subscriptionDeletion.delete(authProvider.getUserId(), authorId)
    }

    @GetMapping("/users/{userId}/subscriptions/status")
    fun getStatus(@PathVariable authorId: UUID): SubscriptionStatusDto =
        subscriptionStatusSelection.select(authorId, authProvider.getUserId())
            .toDto(authorId,authProvider.getUserId())

    @GetMapping("/activity")
    fun getFeed(offset: Int, limit: Int): FeedPageDto =
        subscriptionFeedSelection.select(userId = authProvider.getUserId(), offset = offset, limit = limit).toDto()

}