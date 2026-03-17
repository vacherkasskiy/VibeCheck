package com.vibecheck.subscriptionservice.adapters.postgres

import com.vibecheck.subscriptionservice.adapters.postgres.entity.toEntity
import com.vibecheck.subscriptionservice.adapters.postgres.repository.UserProfileRepository
import com.vibecheck.subscriptionservice.domain.UserProfile
import com.vibecheck.subscriptionservice.usecase.storage.UserProfileStorage
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@Repository
class UserProfileStorageImpl(
    private val userProfileRepository: UserProfileRepository
) : UserProfileStorage {

    @Transactional(propagation = Propagation.MANDATORY)
    override fun createOrUpdate(userProfile: UserProfile) {
        userProfileRepository.saveAndFlush(userProfile.toEntity())
    }
}