package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.entity.toEntity
import com.vibecheck.userservice.adapters.postgres.repository.UserOnboardingStepRepository
import com.vibecheck.userservice.domain.UserOnboardingStep
import com.vibecheck.userservice.domain.UserOnboardingStepStatus
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.usecase.storage.UserOnboardingStepStorage
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class UserOnboardingStepStorageImpl(
    private val userOnboardingStepRepository: UserOnboardingStepRepository
): UserOnboardingStepStorage {
    override fun findByUserIdAndStatus(
        userId: UUID,
        status: UserOnboardingStepStatus
    ): List<UserOnboardingStep> = userOnboardingStepRepository.findByUserIdAndStatus(userId, status).map { it.toDomain() }

    override fun create(userOnboardingStep: UserOnboardingStep): UserOnboardingStep =
        userOnboardingStepRepository.save(userOnboardingStep.toEntity()).toDomain()

    override fun update(userOnboardingStep: UserOnboardingStep): UserOnboardingStep {
        if (!userOnboardingStepRepository.existsById(userOnboardingStep.id)) {
            throw NotFoundException("User Onboarding step not found")
        }

        return userOnboardingStepRepository.save(userOnboardingStep.toEntity()).toDomain()
    }
}