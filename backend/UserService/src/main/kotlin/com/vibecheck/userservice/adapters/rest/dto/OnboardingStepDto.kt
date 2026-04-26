package com.vibecheck.userservice.adapters.rest.dto

import com.vibecheck.userservice.domain.UserOnboardingStep

data class OnboardingStepDto(
    val currentStep: String?,
)

fun UserOnboardingStep?.toDto(): OnboardingStepDto = OnboardingStepDto(this?.stepId)
