package com.vibecheck.subscriptionservice.adapters.postgres

import com.vibecheck.subscriptionservice.domain.UserProfile
import com.vibecheck.subscriptionservice.usecase.storage.UserProfileStorage
import org.jooq.DSLContext
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Repository
class UserProfileStorageImpl(
    private val dsl: DSLContext,
    private val mapper: PostgresRecordMapper,
) : UserProfileStorage {

    @Transactional(propagation = Propagation.MANDATORY)
    override fun createOrUpdate(userProfile: UserProfile) {
        dsl.insertInto(UserProfileTable.TABLE)
            .set(UserProfileTable.USER_ID, userProfile.userId)
            .set(UserProfileTable.VERSION, userProfile.version)
            .set(UserProfileTable.NAME, userProfile.name)
            .set(UserProfileTable.AVATAR_ID, userProfile.avatarId)
            .set(UserProfileTable.SEX, userProfile.sex.name)
            .set(UserProfileTable.BIRTHDAY, userProfile.birthday)
            .onConflict(UserProfileTable.USER_ID)
            .doUpdate()
            .set(UserProfileTable.VERSION, userProfile.version)
            .set(UserProfileTable.NAME, userProfile.name)
            .set(UserProfileTable.AVATAR_ID, userProfile.avatarId)
            .set(UserProfileTable.SEX, userProfile.sex.name)
            .set(UserProfileTable.BIRTHDAY, userProfile.birthday)
            .execute()
    }

    override fun get(userId: UUID): UserProfile? =
        dsl.selectFrom(UserProfileTable.TABLE)
            .where(UserProfileTable.USER_ID.eq(userId))
            .fetchOne(mapper::toUserProfile)
}
