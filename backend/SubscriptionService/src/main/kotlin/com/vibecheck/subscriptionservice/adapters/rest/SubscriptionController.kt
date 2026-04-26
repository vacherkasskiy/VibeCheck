package com.vibecheck.subscriptionservice.adapters.rest

import com.vibecheck.subscriptionservice.adapters.rest.auth.AuthProvider
import com.vibecheck.subscriptionservice.adapters.rest.dto.FeedPageDto
import com.vibecheck.subscriptionservice.adapters.rest.dto.SubscriptionStatusDto
import com.vibecheck.subscriptionservice.adapters.rest.dto.toDto
import com.vibecheck.subscriptionservice.domain.exception.BadRequestException
import com.vibecheck.subscriptionservice.usecase.SubscriptionCreation
import com.vibecheck.subscriptionservice.usecase.SubscriptionDeletion
import com.vibecheck.subscriptionservice.usecase.SubscriptionFeedSelection
import com.vibecheck.subscriptionservice.usecase.SubscriptionSelection
import com.vibecheck.subscriptionservice.usecase.SubscriptionStatusSelection
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.util.UUID

@RestController
class SubscriptionController(
    private val subscriptionCreation: SubscriptionCreation,
    private val subscriptionDeletion: SubscriptionDeletion,
    private val subscriptionSelection: SubscriptionSelection,
    private val subscriptionStatusSelection: SubscriptionStatusSelection,
    private val subscriptionFeedSelection: SubscriptionFeedSelection,
    private val authProvider: AuthProvider
) {
    @GetMapping("/users/me/subscriptions")
    fun getCurrentUserSubscriptions() =
        subscriptionSelection.select(authProvider.getUserId()).map { it.toDto() }

    @PostMapping("/users/{authorId}/subscriptions")
    fun create(@PathVariable authorId: UUID) {
        subscriptionCreation.create(
            subscriberId = authProvider.getUserId(),
            authorId = authorId
        )
    }

    @GetMapping("/users/{userId}/subscriptions")
    fun getUserSubscriptions(@PathVariable userId: UUID) =
        subscriptionSelection.select(userId).map { it.toDto() }

    @DeleteMapping("/users/{authorId}/subscriptions")
    fun delete(@PathVariable authorId: UUID) {
        subscriptionDeletion.delete(subscriberId = authProvider.getUserId(), authorId = authorId)
    }

    @GetMapping("/users/{authorId}/subscriptions/status")
    fun getStatus(@PathVariable authorId: UUID): SubscriptionStatusDto =
        subscriptionStatusSelection.select(authorId = authorId, subscriberId = authProvider.getUserId())
            .toDto(authorId = authorId, subscriberId = authProvider.getUserId())

    @GetMapping("/activity")
    fun getFeed(
        @RequestParam limit: Int,
        @RequestParam(required = false) cursorCreatedAt: Instant?,
        @RequestParam(required = false) cursorActivityId: UUID?,
    ): FeedPageDto {
        if ((cursorCreatedAt == null) != (cursorActivityId == null)) {
            throw BadRequestException("cursorCreatedAt and cursorActivityId must be provided together")
        }

        return subscriptionFeedSelection.select(
            userId = authProvider.getUserId(),
            limit = limit,
            cursorCreatedAt = cursorCreatedAt,
            cursorActivityId = cursorActivityId,
        ).toDto()
    }

}
