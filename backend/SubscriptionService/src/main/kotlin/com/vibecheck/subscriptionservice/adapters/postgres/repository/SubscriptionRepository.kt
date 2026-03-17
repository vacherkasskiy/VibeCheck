package com.vibecheck.subscriptionservice.adapters.postgres.repository

import com.vibecheck.subscriptionservice.adapters.postgres.entity.SubscriptionEntity
import org.springframework.data.jpa.repository.JpaRepository

interface SubscriptionRepository : JpaRepository<SubscriptionEntity, SubscriptionEntity.SubscriptionId> {
}