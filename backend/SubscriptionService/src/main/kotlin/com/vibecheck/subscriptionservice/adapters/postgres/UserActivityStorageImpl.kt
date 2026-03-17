package com.vibecheck.subscriptionservice.adapters.postgres

import com.vibecheck.subscriptionservice.adapters.postgres.entity.toEntity
import com.vibecheck.subscriptionservice.adapters.postgres.repository.UserActivityRepository
import com.vibecheck.subscriptionservice.domain.UserActivity
import com.vibecheck.subscriptionservice.usecase.storage.UserActivityStorage
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@Repository
class UserActivityStorageImpl(
    private val userActivityRepository: UserActivityRepository
) : UserActivityStorage {

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(activity: UserActivity) {
        userActivityRepository.save(activity.toEntity())
    }
}