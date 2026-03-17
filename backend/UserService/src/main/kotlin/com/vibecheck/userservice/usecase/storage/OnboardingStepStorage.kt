package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.OnboardingStep

interface OnboardingStepStorage {
    fun findById(id: String): OnboardingStep
    fun findPrimary(): OnboardingStep
    fun findAll() : List<OnboardingStep>
}