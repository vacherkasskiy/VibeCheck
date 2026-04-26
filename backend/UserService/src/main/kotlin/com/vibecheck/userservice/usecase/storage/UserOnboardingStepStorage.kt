package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.UserOnboardingStep
import com.vibecheck.userservice.domain.UserOnboardingStepStatus
import com.vibecheck.userservice.domain.exception.NotFoundException
import java.util.UUID

interface UserOnboardingStepStorage {
    fun findByUserIdAndStatus(userId: UUID, status: UserOnboardingStepStatus): List<UserOnboardingStep>

    fun create(userOnboardingStep: UserOnboardingStep): UserOnboardingStep

    fun update(userOnboardingStep: UserOnboardingStep): UserOnboardingStep
}