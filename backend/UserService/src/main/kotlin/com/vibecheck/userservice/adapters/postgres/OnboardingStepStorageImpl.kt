package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.repository.OnboardingStepRepository
import com.vibecheck.userservice.domain.OnboardingStep
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.usecase.storage.OnboardingStepStorage
import org.springframework.stereotype.Repository
import kotlin.jvm.optionals.getOrNull

@Repository
class OnboardingStepStorageImpl(
    private val onboardingStepRepository: OnboardingStepRepository
): OnboardingStepStorage {
    override fun findById(id: String): OnboardingStep =
        onboardingStepRepository.findById(id).getOrNull()
            ?.toDomain()
            ?: throw NotFoundException("Onboarding step $id is not found")

    override fun findPrimary(): OnboardingStep =
        onboardingStepRepository.findByIsPrimaryIsTrue()
            ?.toDomain()
            ?: throw RuntimeException("Primary onboarding step is not found")

    override fun findAll(): List<OnboardingStep> =
        onboardingStepRepository.findAll()
            .map { it.toDomain() }
}