package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.domain.UserOnboardingStep
import com.vibecheck.userservice.domain.UserRole
import com.vibecheck.userservice.usecase.generator.UuidGenerator
import com.vibecheck.userservice.usecase.storage.OnboardingStepStorage
import com.vibecheck.userservice.usecase.storage.UserOnboardingStepStorage
import com.vibecheck.userservice.usecase.storage.UserStorage
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.util.UUID

@Service
class UserCreation(
    private val userStorage: UserStorage,
    private val onboardingStepStorage: OnboardingStepStorage,
    private val userOnboardingStepStorage: UserOnboardingStepStorage,
    private val uuidGenerator: UuidGenerator,
    private val transactionTemplate: TransactionTemplate
) {
    fun create(email: String, password: String, roles: List<UserRole>) {
        val user = User.new(uuidGenerator.generate(), email, password, roles)
        val step = initializeUserOnboardingStep(user.id)
        transactionTemplate.execute {
            userStorage.create(user)
            userOnboardingStepStorage.create(step)
        }
    }

    private fun initializeUserOnboardingStep(userId: UUID): UserOnboardingStep {
        val primaryStep = onboardingStepStorage.findPrimary()

        return UserOnboardingStep.new(userId, primaryStep.id)
    }
}