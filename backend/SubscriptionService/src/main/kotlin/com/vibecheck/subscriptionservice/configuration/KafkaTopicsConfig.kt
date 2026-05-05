package com.vibecheck.subscriptionservice.configuration

import org.apache.kafka.clients.admin.NewTopic
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.kafka.config.TopicBuilder

@Configuration
class KafkaTopicsConfig(
    @Value("\${app.kafka.topics.users:users}")
    private val usersTopic: String,
    @Value("\${app.kafka.topics.reviews-written:reviews-written}")
    private val reviewsWrittenTopic: String,
    @Value("\${app.kafka.topics.reviews-liked:reviews-liked}")
    private val reviewsLikedTopic: String,
    @Value("\${app.kafka.topics.gamification-achievement:gamification-achievement}")
    private val gamificationAchievementTopic: String,
    @Value("\${app.kafka.topics.gamification-level:gamification-level}")
    private val gamificationLevelTopic: String,
    @Value("\${app.kafka.topics.subscriptions:subscriptions}")
    private val subscriptionsTopic: String,
    @Value("\${app.kafka.topic-defaults.partitions:1}")
    private val partitions: Int,
    @Value("\${app.kafka.topic-defaults.replicas:1}")
    private val replicas: Int,
) {
    @Bean
    fun usersTopic(): NewTopic = topic(usersTopic)

    @Bean
    fun reviewsWrittenTopic(): NewTopic = topic(reviewsWrittenTopic)

    @Bean
    fun reviewsLikedTopic(): NewTopic = topic(reviewsLikedTopic)

    @Bean
    fun gamificationAchievementTopic(): NewTopic = topic(gamificationAchievementTopic)

    @Bean
    fun gamificationLevelTopic(): NewTopic = topic(gamificationLevelTopic)

    @Bean
    fun subscriptionsTopic(): NewTopic = topic(subscriptionsTopic)

    private fun topic(name: String): NewTopic =
        TopicBuilder.name(name)
            .partitions(partitions)
            .replicas(replicas)
            .build()
}
