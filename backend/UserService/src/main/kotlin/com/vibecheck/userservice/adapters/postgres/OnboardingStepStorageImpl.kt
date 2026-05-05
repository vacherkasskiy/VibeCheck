package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.domain.OnboardingStep
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.usecase.storage.OnboardingStepStorage
import org.jooq.DSLContext
import org.springframework.stereotype.Repository

@Repository
class OnboardingStepStorageImpl(
    private val dsl: DSLContext,
    private val mapper: PostgresRecordMapper,
) : OnboardingStepStorage {
    override fun create(onboardingStep: OnboardingStep): OnboardingStep =
        dsl.insertInto(OnboardingStepTable.TABLE)
            .set(OnboardingStepTable.ID, onboardingStep.id)
            .set(OnboardingStepTable.NEXT_STEP_ID, onboardingStep.nextStepId)
            .set(OnboardingStepTable.IS_PRIMARY, onboardingStep.isPrimary)
            .returning(
                OnboardingStepTable.ID,
                OnboardingStepTable.NEXT_STEP_ID,
                OnboardingStepTable.IS_PRIMARY,
            )
            .fetchOne(mapper::toOnboardingStep)
            ?: error("Failed to create onboarding step ${onboardingStep.id}")

    override fun findById(id: String): OnboardingStep =
        dsl.selectFrom(OnboardingStepTable.TABLE)
            .where(OnboardingStepTable.ID.eq(id))
            .fetchOne(mapper::toOnboardingStep)
            ?: throw NotFoundException("Onboarding step $id is not found")

    override fun findPrimary(): OnboardingStep =
        dsl.selectFrom(OnboardingStepTable.TABLE)
            .where(OnboardingStepTable.IS_PRIMARY.isTrue)
            .limit(1)
            .fetchOne(mapper::toOnboardingStep)
            ?: throw RuntimeException("Primary onboarding step is not found")

    override fun findAll(): List<OnboardingStep> =
        dsl.selectFrom(OnboardingStepTable.TABLE)
            .fetch(mapper::toOnboardingStep)
}
