package com.vibecheck.userservice.adapters.postgres.repository

import com.vibecheck.userservice.adapters.postgres.entity.UserOnboardingStepEntity
import com.vibecheck.userservice.domain.UserOnboardingStepStatus
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserOnboardingStepRepository: JpaRepository<UserOnboardingStepEntity, Long> {
    fun findByUserIdAndStatus(
        userId: UUID,
        status: UserOnboardingStepStatus
    ): List<UserOnboardingStepEntity>
}