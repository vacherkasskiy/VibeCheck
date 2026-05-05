package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.domain.UserOnboardingStep
import com.vibecheck.userservice.domain.UserOnboardingStepStatus
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.domain.exception.OptimisticLockException
import com.vibecheck.userservice.usecase.storage.UserOnboardingStepStorage
import org.jooq.DSLContext
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.time.Clock
import java.time.Instant
import java.util.UUID

@Repository
class UserOnboardingStepStorageImpl(
    private val dsl: DSLContext,
    private val mapper: PostgresRecordMapper,
    private val clock: Clock
) : UserOnboardingStepStorage {
    override fun existsByUserId(userId: UUID): Boolean =
        dsl.fetchExists(
            dsl.selectOne()
                .from(UserOnboardingStepTable.TABLE)
                .where(UserOnboardingStepTable.USER_ID.eq(userId))
        )

    override fun findByUserIdAndStatus(
        userId: UUID,
        status: UserOnboardingStepStatus,
    ): List<UserOnboardingStep> =
        dsl.selectFrom(UserOnboardingStepTable.TABLE)
            .where(UserOnboardingStepTable.USER_ID.eq(userId))
            .and(UserOnboardingStepTable.STATUS.eq(status.name))
            .orderBy(UserOnboardingStepTable.ID.asc())
            .fetch(mapper::toUserOnboardingStep)

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(userOnboardingStep: UserOnboardingStep): UserOnboardingStep {
        val now = clock.instant()

        return dsl.insertInto(UserOnboardingStepTable.TABLE)
            .set(UserOnboardingStepTable.USER_ID, userOnboardingStep.userId)
            .set(UserOnboardingStepTable.STEP_ID, userOnboardingStep.stepId)
            .set(UserOnboardingStepTable.VERSION, userOnboardingStep.version)
            .set(UserOnboardingStepTable.STATUS, userOnboardingStep.status.name)
            .set(UserOnboardingStepTable.CREATED_AT, now)
            .set(UserOnboardingStepTable.UPDATED_AT, now)
            .returning(
                UserOnboardingStepTable.ID,
                UserOnboardingStepTable.USER_ID,
                UserOnboardingStepTable.STEP_ID,
                UserOnboardingStepTable.VERSION,
                UserOnboardingStepTable.STATUS,
                UserOnboardingStepTable.CREATED_AT,
                UserOnboardingStepTable.UPDATED_AT,
            )
            .fetchOne(mapper::toUserOnboardingStep)
            ?: error("Failed to create user onboarding step")
    }

    @Transactional(propagation = Propagation.MANDATORY)
    override fun update(userOnboardingStep: UserOnboardingStep): UserOnboardingStep {
        val id = requireNotNull(userOnboardingStep.id)
        return dsl.update(UserOnboardingStepTable.TABLE)
            .set(UserOnboardingStepTable.USER_ID, userOnboardingStep.userId)
            .set(UserOnboardingStepTable.STEP_ID, userOnboardingStep.stepId)
            .set(UserOnboardingStepTable.STATUS, userOnboardingStep.status.name)
            .set(UserOnboardingStepTable.VERSION, userOnboardingStep.version + 1)
            .set(UserOnboardingStepTable.UPDATED_AT, clock.instant())
            .where(UserOnboardingStepTable.ID.eq(id))
            .and(UserOnboardingStepTable.VERSION.eq(userOnboardingStep.version))
            .returning(
                UserOnboardingStepTable.ID,
                UserOnboardingStepTable.USER_ID,
                UserOnboardingStepTable.STEP_ID,
                UserOnboardingStepTable.VERSION,
                UserOnboardingStepTable.STATUS,
                UserOnboardingStepTable.CREATED_AT,
                UserOnboardingStepTable.UPDATED_AT,
            )
            .fetchOne(mapper::toUserOnboardingStep)
            ?: throw OptimisticLockException("User onboarding step $id has been modified concurrently")
    }
}
