package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.domain.UserProfile
import com.vibecheck.userservice.domain.exception.BadRequestException
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.domain.exception.OptimisticLockException
import com.vibecheck.userservice.usecase.storage.UserProfileStorage
import org.jooq.DSLContext
import org.jooq.exception.IntegrityConstraintViolationException
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.time.Clock
import java.time.Instant
import java.util.UUID

@Repository
class UserProfileStorageImpl(
    private val dsl: DSLContext,
    private val mapper: PostgresRecordMapper,
    private val clock: Clock
) : UserProfileStorage {
    override fun findById(userId: UUID): UserProfile =
        dsl.selectFrom(UserProfileTable.TABLE)
            .where(UserProfileTable.USER_ID.eq(userId))
            .fetchOne(mapper::toUserProfile)
            ?: throw NotFoundException("Profile for user $userId is not found")

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(userProfile: UserProfile): UserProfile {
        val now = clock.instant()



        val request = dsl.insertInto(UserProfileTable.TABLE)
            .set(UserProfileTable.USER_ID, userProfile.userId)
            .set(UserProfileTable.VERSION, userProfile.version)
            .set(UserProfileTable.NAME, userProfile.name)
            .set(UserProfileTable.SEX, userProfile.sex.name)
            .set(UserProfileTable.AVATAR_ID, userProfile.avatarId)
            .set(UserProfileTable.BIRTHDAY, userProfile.birthday)
            .set(UserProfileTable.EDUCATION, userProfile.education.name)
            .set(UserProfileTable.SPECIALITY, userProfile.speciality.name)
            .set(UserProfileTable.WORK_EXPERIENCE, mapper.toJsonb(userProfile.workExperience.map { it.toDto() }))
            .set(UserProfileTable.CREATED_AT, now)
            .set(UserProfileTable.UPDATED_AT, now)
            .returning(
                USER_PROFILE_FIELDS
            )

        return try {
            request.fetchOne(mapper::toUserProfile)
                ?: error("Failed to create profile for user ${userProfile.userId}")
        } catch (_: IntegrityConstraintViolationException) {
            throw BadRequestException("User profile for user ${userProfile.userId} already exists")
        }
    }

    @Transactional(propagation = Propagation.MANDATORY)
    override fun update(userProfile: UserProfile): UserProfile {
        val updated = dsl.update(UserProfileTable.TABLE)
            .set(UserProfileTable.VERSION, userProfile.version + 1)
            .set(UserProfileTable.NAME, userProfile.name)
            .set(UserProfileTable.SEX, userProfile.sex.name)
            .set(UserProfileTable.AVATAR_ID, userProfile.avatarId)
            .set(UserProfileTable.BIRTHDAY, userProfile.birthday)
            .set(UserProfileTable.EDUCATION, userProfile.education.name)
            .set(UserProfileTable.SPECIALITY, userProfile.speciality.name)
            .set(UserProfileTable.WORK_EXPERIENCE, mapper.toJsonb(userProfile.workExperience.map { it.toDto() }))
            .set(UserProfileTable.UPDATED_AT, clock.instant())
            .where(UserProfileTable.USER_ID.eq(userProfile.userId))
            .and(UserProfileTable.VERSION.eq(userProfile.version))
            .returning(
                USER_PROFILE_FIELDS
            )
            .fetchOne()

        if (updated == null) {
            throw OptimisticLockException("Profile for user ${userProfile.userId} has been modified concurrently")
        }

        return mapper.toUserProfile(updated)
    }

    private companion object {
        private val USER_PROFILE_FIELDS = listOf(
            UserProfileTable.USER_ID,
            UserProfileTable.VERSION,
            UserProfileTable.NAME,
            UserProfileTable.SEX,
            UserProfileTable.AVATAR_ID,
            UserProfileTable.BIRTHDAY,
            UserProfileTable.EDUCATION,
            UserProfileTable.SPECIALITY,
            UserProfileTable.WORK_EXPERIENCE,
            UserProfileTable.CREATED_AT,
            UserProfileTable.UPDATED_AT,
        )
    }
}
