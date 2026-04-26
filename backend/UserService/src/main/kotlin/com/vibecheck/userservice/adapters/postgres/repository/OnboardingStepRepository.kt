package com.vibecheck.userservice.adapters.postgres.repository

import com.vibecheck.userservice.adapters.postgres.entity.OnboardingStepEntity
import com.vibecheck.userservice.domain.OnboardingStep
import org.springframework.data.jpa.repository.JpaRepository

interface OnboardingStepRepository: JpaRepository<OnboardingStepEntity, String> {
    fun findByIsPrimaryIsTrue(): OnboardingStepEntity?
}