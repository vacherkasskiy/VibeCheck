package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.UserOnboardingStep
import com.vibecheck.userservice.domain.UserOnboardingStepStatus
import com.vibecheck.userservice.usecase.storage.OnboardingStepStorage
import com.vibecheck.userservice.usecase.storage.UserOnboardingStepStorage
import org.springframework.cache.annotation.CachePut
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.util.UUID

@Service
class UserOnboardingStepCompleting(
    private val userOnboardingStepStorage: UserOnboardingStepStorage,
    private val onboardingStepStorage: OnboardingStepStorage,
    private val transactionTemplate: TransactionTemplate,
) {
    @CachePut(value = ["users.onboarding"], key = "#userId")
    fun complete(userId: UUID): UserOnboardingStep? {
        val currentUserStep = userOnboardingStepStorage.findByUserIdAndStatus(userId, UserOnboardingStepStatus.ACTIVE).singleOrNull()
            ?: return null

        val step = onboardingStepStorage.findById(currentUserStep.stepId)

        val nextStep = step.nextStepId?.let { onboardingStepStorage.findById(it) }

        return transactionTemplate.execute {
            userOnboardingStepStorage.update(currentUserStep.complete())

            nextStep?.let { userOnboardingStepStorage.create(UserOnboardingStep.new(userId, it.id)) }
        }
    }
}
