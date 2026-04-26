package com.vibecheck.subscriptionservice.usecase

import com.vibecheck.subscriptionservice.domain.UserProfile
import com.vibecheck.subscriptionservice.usecase.cache.UserProfileCache
import com.vibecheck.subscriptionservice.usecase.storage.UserProfileStorage
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate

@Service
class UserProfileSaving(
    private val userProfileStorage: UserProfileStorage,
    private val userProfileCache: UserProfileCache,
    private val transactionTemplate: TransactionTemplate,
) {
    fun save(userProfile: UserProfile) {
        transactionTemplate.execute {
            userProfileStorage.createOrUpdate(userProfile)
        }

        userProfileCache.put(userProfile)
    }
}