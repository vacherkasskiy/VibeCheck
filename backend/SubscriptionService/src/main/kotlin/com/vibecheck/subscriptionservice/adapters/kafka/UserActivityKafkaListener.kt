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
import org.slf4j.LoggerFactory
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
    @Value("\${app.kafka.topics.reviews-written:reviews-written}")
    private val reviewWrittenTopic: String,
    @Value("\${app.kafka.topics.reviews-liked:reviews-liked}")
    private val reviewLikedTopic: String,
    @Value("\${app.kafka.topics.gamification-achievement:gamification-achievement}")
    private val achievementTopic: String,
    @Value("\${app.kafka.topics.gamification-level:gamification-level}")
    private val levelTopic: String,
    @Value("\${app.kafka.topics.subscriptions:subscriptions}")
    private val subscriptionsTopic: String,
) {
    @KafkaListener(
        topics = ["\${app.kafka.topics.reviews-written:reviews-written}"],
        containerFactory = "kafkaByteArrayListenerContainerFactory",
    )
    fun onReviewWritten(message: ByteArray, acknowledgment: Acknowledgment) =
        consume(
            topic = reviewWrittenTopic,
            message = message,
            acknowledgment = acknowledgment,
            parse = ReviewEvents.ReviewWrittenEvent::parseFrom,
            onReceived = { event ->
                log.info(
                    "Received review written eventId={}, userId={}, reviewId={}, topic={}",
                    event.meta.eventId,
                    event.userId,
                    event.reviewId,
                    reviewWrittenTopic,
                )
            },
            onProcessed = { event ->
                log.info(
                    "Processed review written eventId={}, userId={}, reviewId={}, topic={}",
                    event.meta.eventId,
                    event.userId,
                    event.reviewId,
                    reviewWrittenTopic,
                )
            },
        ) { event ->
            createActivity(
                userId = UUID.fromString(event.userId),
                createdAt = event.createdAt.toInstant(),
                info = ReviewWrittenInfo(
                    reviewId = event.reviewId,
                    reviewCompanyId = "",
                    reviewCompanyName = "",
                )
            )
        }

    @KafkaListener(
        topics = ["\${app.kafka.topics.reviews-liked:reviews-liked}"],
        containerFactory = "kafkaByteArrayListenerContainerFactory",
    )
    fun onReviewLiked(message: ByteArray, acknowledgment: Acknowledgment) =
        consume(
            topic = reviewLikedTopic,
            message = message,
            acknowledgment = acknowledgment,
            parse = ReviewEvents.ReviewLikedEvent::parseFrom,
            onReceived = { event ->
                log.info(
                    "Received review liked eventId={}, userId={}, reviewId={}, topic={}",
                    event.meta.eventId,
                    event.likedByUserId,
                    event.reviewId,
                    reviewLikedTopic,
                )
            },
            onProcessed = { event ->
                log.info(
                    "Processed review liked eventId={}, userId={}, reviewId={}, topic={}",
                    event.meta.eventId,
                    event.likedByUserId,
                    event.reviewId,
                    reviewLikedTopic,
                )
            },
        ) { event ->
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
        }

    @KafkaListener(
        topics = ["\${app.kafka.topics.gamification-achievement:gamification-achievement}"],
        containerFactory = "kafkaByteArrayListenerContainerFactory",
    )
    fun onAchievementGranted(message: ByteArray, acknowledgment: Acknowledgment) =
        consume(
            topic = achievementTopic,
            message = message,
            acknowledgment = acknowledgment,
            parse = GamificationEvents.AchievementGrantedEvent::parseFrom,
            onReceived = { event ->
                log.info(
                    "Received achievement granted eventId={}, userId={}, achievementId={}, topic={}",
                    event.meta.eventId,
                    event.userId,
                    event.achievementId,
                    achievementTopic,
                )
            },
            onProcessed = { event ->
                log.info(
                    "Processed achievement granted eventId={}, userId={}, achievementId={}, topic={}",
                    event.meta.eventId,
                    event.userId,
                    event.achievementId,
                    achievementTopic,
                )
            },
        ) { event ->
            createActivity(
                userId = UUID.fromString(event.userId),
                createdAt = event.grantedAt.toInstant(),
                info = AchievementGrantedInfo(
                    achievementId = event.achievementId,
                    achievementName = event.achievementName,
                )
            )
        }

    @KafkaListener(
        topics = ["\${app.kafka.topics.gamification-level:gamification-level}"],
        containerFactory = "kafkaByteArrayListenerContainerFactory",
    )
    fun onUserLevelUp(message: ByteArray, acknowledgment: Acknowledgment) =
        consume(
            topic = levelTopic,
            message = message,
            acknowledgment = acknowledgment,
            parse = GamificationEvents.UserLevelUpEvent::parseFrom,
            onReceived = { event ->
                log.info(
                    "Received user level up eventId={}, userId={}, newLevel={}, topic={}",
                    event.meta.eventId,
                    event.userId,
                    event.newLevel,
                    levelTopic,
                )
            },
            onProcessed = { event ->
                log.info(
                    "Processed user level up eventId={}, userId={}, newLevel={}, topic={}",
                    event.meta.eventId,
                    event.userId,
                    event.newLevel,
                    levelTopic,
                )
            },
        ) { event ->
            createActivity(
                userId = UUID.fromString(event.userId),
                createdAt = event.leveledAt.toInstant(),
                info = UserLevelUpInfo(newLevel = event.newLevel.toInt())
            )
        }

    @KafkaListener(
        topics = ["\${app.kafka.topics.subscriptions:subscriptions}"],
        containerFactory = "kafkaByteArrayListenerContainerFactory",
    )
    fun onUserSubscribed(message: ByteArray, acknowledgment: Acknowledgment) =
        consume(
            topic = subscriptionsTopic,
            message = message,
            acknowledgment = acknowledgment,
            parse = SubscriptionEvents.UserSubscribedEvent::parseFrom,
            onReceived = { event ->
                log.info(
                    "Received subscription eventId={}, followerId={}, targetUserId={}, topic={}",
                    event.meta.eventId,
                    event.followerId,
                    event.targetUserId,
                    subscriptionsTopic,
                )
            },
            onProcessed = { event ->
                log.info(
                    "Processed subscription eventId={}, followerId={}, targetUserId={}, topic={}",
                    event.meta.eventId,
                    event.followerId,
                    event.targetUserId,
                    subscriptionsTopic,
                )
            },
        ) { event ->
            val targetUserId = UUID.fromString(event.targetUserId)

            createActivity(
                userId = UUID.fromString(event.followerId),
                createdAt = event.createdAt.toInstant(),
                info = UserFollowedInfo(
                    userId = targetUserId,
                    name = cachedUserProfileProvider.getOrNull(targetUserId)?.name ?: targetUserId.toString(),
                )
            )
        }

    private inline fun <T> consume(
        topic: String,
        message: ByteArray,
        acknowledgment: Acknowledgment,
        parse: (ByteArray) -> T,
        onReceived: (T) -> Unit,
        onProcessed: (T) -> Unit,
        handle: (T) -> Unit,
    ) {
        runCatching {
            val event = parse(message)
            onReceived(event)
            handle(event)
            acknowledgment.acknowledge()
            onProcessed(event)
        }.getOrElse { error ->
            log.error("Failed to process message from topic={}", topic, error)
            throw error
        }
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

    private companion object {
        private val log = LoggerFactory.getLogger(UserActivityKafkaListener::class.java)
    }
}
