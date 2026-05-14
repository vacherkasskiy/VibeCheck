package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.UserOnboardingStep
import com.vibecheck.userservice.domain.UserOnboardingStepStatus
import com.vibecheck.userservice.usecase.storage.UserOnboardingStepStorage
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserOnboardingStepSelection(
    private val userOnboardingStepStorage: UserOnboardingStepStorage
) {
    fun select(userId: UUID): UserOnboardingStep? =
        userOnboardingStepStorage.findByUserIdAndStatus(userId, UserOnboardingStepStatus.ACTIVE).singleOrNull()
}
