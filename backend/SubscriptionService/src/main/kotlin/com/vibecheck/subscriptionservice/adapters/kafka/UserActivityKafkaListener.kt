package com.vibecheck.subscriptionservice.adapters.kafka

import achievements.GamificationEvents
import com.google.protobuf.Timestamp
import com.vibecheck.subscriptionservice.domain.AchievementGrantedInfo
import com.vibecheck.subscriptionservice.domain.ReviewLikedInfo
import com.vibecheck.subscriptionservice.domain.ReviewWrittenInfo
import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.domain.UserFollowedInfo
import com.vibecheck.subscriptionservice.domain.UserInfo
import com.vibecheck.subscriptionservice.domain.UserLevelUpInfo
import com.vibecheck.subscriptionservice.usecase.provider.CachedUserProfileProvider
import com.vibecheck.subscriptionservice.usecase.UserActivityCreation
import org.springframework.beans.factory.annotation.Value
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.support.Acknowledgment
import org.springframework.stereotype.Service
import reviews.ReviewEvents
import subscriptions.SubscriptionEvents
import java.time.Duration
import java.time.Instant
import java.util.UUID

@Service
class UserActivityKafkaListener(
    private val userActivityCreation: UserActivityCreation,
    private val cachedUserProfileProvider: CachedUserProfileProvider,
    @Value("\${app.feed.activity-ttl:P30D}")
    private val activityTtl: Duration,
) {

    @KafkaListener(
        topics = ["\${app.kafka.topics.reviews-written:reviews-written}"],
        containerFactory = "kafkaByteArrayListenerContainerFactory",
    )
    fun onReviewWritten(message: ByteArray, acknowledgment: Acknowledgment) {
        val event = ReviewEvents.ReviewWrittenEvent.parseFrom(message)

        createActivity(
            userId = UUID.fromString(event.userId),
            createdAt = event.createdAt.toInstant(),
            info = ReviewWrittenInfo(
                reviewId = event.reviewId,
                reviewCompanyId = "",
                reviewCompanyName = "",
            )
        )

        acknowledgment.acknowledge()
    }

    @KafkaListener(
        topics = ["\${app.kafka.topics.reviews-liked:reviews-liked}"],
        containerFactory = "kafkaByteArrayListenerContainerFactory",
    )
    fun onReviewLiked(message: ByteArray, acknowledgment: Acknowledgment) {
        val event = ReviewEvents.ReviewLikedEvent.parseFrom(message)

        createActivity(
            userId = UUID.fromString(event.likedByUserId),
            createdAt = event.likedAt.toInstant(),
            info = ReviewLikedInfo(
                reviewId = event.reviewId,
                reviewAuthorId = UUID.fromString(event.reviewAuthorId),
                reviewCompanyId = event.reviewCompanyId,
                reviewCompanyName = event.reviewCompanyName,
            )
        )

        acknowledgment.acknowledge()
    }

    @KafkaListener(
        topics = ["\${app.kafka.topics.gamification-achievement:gamification-achievement}"],
        containerFactory = "kafkaByteArrayListenerContainerFactory",
    )
    fun onAchievementGranted(message: ByteArray, acknowledgment: Acknowledgment) {
        val event = GamificationEvents.AchievementGrantedEvent.parseFrom(message)

        createActivity(
            userId = UUID.fromString(event.userId),
            createdAt = event.grantedAt.toInstant(),
            info = AchievementGrantedInfo(
                achievementId = event.achievementId,
                achievementName = event.achievementName,
            )
        )

        acknowledgment.acknowledge()
    }

    @KafkaListener(
        topics = ["\${app.kafka.topics.gamification-level:gamification-level}"],
        containerFactory = "kafkaByteArrayListenerContainerFactory",
    )
    fun onUserLevelUp(message: ByteArray, acknowledgment: Acknowledgment) {
        val event = GamificationEvents.UserLevelUpEvent.parseFrom(message)

        createActivity(
            userId = UUID.fromString(event.userId),
            createdAt = event.leveledAt.toInstant(),
            info = UserLevelUpInfo(newLevel = event.newLevel.toInt())
        )

        acknowledgment.acknowledge()
    }

    @KafkaListener(
        topics = ["\${app.kafka.topics.subscriptions:subscriptions}"],
        containerFactory = "kafkaByteArrayListenerContainerFactory",
    )
    fun onUserSubscribed(message: ByteArray, acknowledgment: Acknowledgment) {
        val event = SubscriptionEvents.UserSubscribedEvent.parseFrom(message)
        val targetUserId = UUID.fromString(event.targetUserId)

        createActivity(
            userId = UUID.fromString(event.followerId),
            createdAt = event.createdAt.toInstant(),
            info = UserFollowedInfo(
                userId = targetUserId,
                name = cachedUserProfileProvider.getOrNull(targetUserId)?.name ?: targetUserId.toString(),
            )
        )

        acknowledgment.acknowledge()
    }

    private fun createActivity(
        userId: UUID,
        createdAt: Instant,
        info: UserInfo,
    ) {
        userActivityCreation.create(
            UserActivity(
                id = UUID.randomUUID(),
                userId = userId,
                activityInfo = info,
                createdAt = createdAt,
                expiredAt = createdAt.plus(activityTtl),
            )
        )
    }

    private fun Timestamp.toInstant(): Instant = Instant.ofEpochSecond(seconds, nanos.toLong())
}
