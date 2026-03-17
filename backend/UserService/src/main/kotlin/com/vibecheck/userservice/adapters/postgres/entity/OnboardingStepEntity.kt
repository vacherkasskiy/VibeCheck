package com.vibecheck.userservice.adapters.postgres.entity

import com.vibecheck.userservice.domain.OnboardingStep
import com.vibecheck.userservice.domain.UserOnboardingStep
import com.vibecheck.userservice.domain.UserOnboardingStepStatus
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "onboarding_step")
class OnboardingStepEntity {
    @Id
    var id: String? = null

    @Column(name = "next_step_id", nullable = false)
    var nextStepId: String? = null

    @Column(name = "is_primary", nullable = false)
    var isPrimary: Boolean? = null

    fun toEntity(domain: OnboardingStep): OnboardingStepEntity = apply {
        id = domain.id
        nextStepId = domain.nextStepId
        isPrimary = domain.isPrimary
    }

    fun toDomain(): OnboardingStep = OnboardingStep(
        id = requireNotNull(id),
        nextStepId = nextStepId,
        isPrimary = requireNotNull(isPrimary),
    )
}

fun OnboardingStep.toEntity(): OnboardingStepEntity = OnboardingStepEntity().toEntity(this)