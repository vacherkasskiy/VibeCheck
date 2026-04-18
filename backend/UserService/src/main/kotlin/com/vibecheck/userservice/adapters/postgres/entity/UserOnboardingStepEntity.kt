package com.vibecheck.userservice.adapters.postgres.entity

import com.vibecheck.userservice.domain.UserOnboardingStep
import com.vibecheck.userservice.domain.UserOnboardingStepStatus
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.Version
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "user_onboarding_step")
class UserOnboardingStepEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @Column(name = "user_id", nullable = false)
    var userId: UUID? = null

    @Column(name = "step_id", nullable = false)
    var stepId: String? = null

    @Version
    var version: Int? = null

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: UserOnboardingStepStatus? = null

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    var createdAt: Instant? = null

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    var updatedAt: Instant? = null

    fun toEntity(domain: UserOnboardingStep): UserOnboardingStepEntity = apply {
        id = domain.id
        userId = domain.userId
        stepId = domain.stepId
        version = if (domain.version == 0) null else domain.version
        status = domain.status
    }

    fun toDomain(): UserOnboardingStep = UserOnboardingStep(
        id = this.id,
        userId = requireNotNull(userId),
        stepId = requireNotNull(stepId),
        version = requireNotNull(version),
        status = requireNotNull(status)
    )
}

fun UserOnboardingStep.toEntity(): UserOnboardingStepEntity = UserOnboardingStepEntity().toEntity(this)