package com.vibecheck.userservice.domain

data class OnboardingStep(
    val id: String,
    val nextStepId: String?,
    val isPrimary: Boolean
)
