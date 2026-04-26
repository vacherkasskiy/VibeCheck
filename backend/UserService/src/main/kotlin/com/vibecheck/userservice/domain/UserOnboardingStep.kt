package com.vibecheck.userservice.domain

import java.util.UUID

data class UserOnboardingStep(
    val id: Long?,
    val userId: UUID,
    val stepId: String,
    val version: Int,
    val status: UserOnboardingStepStatus
) {
    fun complete(): UserOnboardingStep = copy(status = UserOnboardingStepStatus.COMPLETED)

    companion object {
        fun new(userId: UUID, stepId: String): UserOnboardingStep =
            UserOnboardingStep(
                id = null,
                userId = userId,
                stepId = stepId,
                version = 0,
                status = UserOnboardingStepStatus.ACTIVE
            )
    }
}