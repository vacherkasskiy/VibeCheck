package com.vibecheck.subscriptionservice.adapters.postgres.repository

import com.vibecheck.subscriptionservice.adapters.postgres.entity.UserActivityEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserActivityRepository : JpaRepository<UserActivityEntity, UUID> {
}