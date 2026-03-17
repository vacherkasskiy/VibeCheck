package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.entity.toEntity
import com.vibecheck.userservice.adapters.postgres.repository.UserProfileRepository
import com.vibecheck.userservice.domain.UserProfile
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.usecase.storage.UserProfileStorage
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.util.UUID
import kotlin.jvm.optionals.getOrNull

@Repository
class UserProfileStorageImpl(
    private val userProfileRepository: UserProfileRepository
) : UserProfileStorage {
    override fun findById(userId: UUID): UserProfile =
        userProfileRepository.findById(userId).getOrNull()
            ?.toDomain()
            ?: throw NotFoundException("Profile for user $userId is not found")

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(userProfile: UserProfile): UserProfile =
        userProfileRepository.saveAndFlush(userProfile.toEntity()).toDomain()

    @Transactional(propagation = Propagation.MANDATORY)
    override fun update(userProfile: UserProfile): UserProfile {
        if (!userProfileRepository.existsById(userProfile.userId))
            throw NotFoundException("Profile for user ${userProfile.userId} is not found")
        return userProfileRepository.saveAndFlush(userProfile.toEntity()).toDomain()
    }
}