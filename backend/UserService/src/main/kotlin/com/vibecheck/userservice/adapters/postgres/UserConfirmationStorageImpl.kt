package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.domain.UserConfirmation
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.usecase.storage.UserConfirmationStorage
import org.jooq.DSLContext
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.time.Clock
import java.time.Instant

@Repository
class UserConfirmationStorageImpl(
    private val dsl: DSLContext,
    private val mapper: PostgresRecordMapper,
    private val clock: Clock
) : UserConfirmationStorage {
    override fun findById(id: Int): UserConfirmation =
        dsl.selectFrom(UserConfirmationTable.TABLE)
            .where(UserConfirmationTable.CONFIRM_CODE.eq(id))
            .fetchOne(mapper::toUserConfirmation)
            ?: throw NotFoundException("UserPreregistration not found")

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(userConfirmation: UserConfirmation) {
        val now = clock.instant()

        dsl.insertInto(UserConfirmationTable.TABLE)
            .set(UserConfirmationTable.CONFIRM_CODE, userConfirmation.confirmCode)
            .set(UserConfirmationTable.EMAIL, userConfirmation.email)
            .set(UserConfirmationTable.PASSWORD, userConfirmation.password)
            .set(UserConfirmationTable.EXPIRED_AT, userConfirmation.expiredAt)
            .set(UserConfirmationTable.CREATED_AT, now)
            .set(UserConfirmationTable.UPDATED_AT, now)
            .execute()
    }

    @Transactional(propagation = Propagation.MANDATORY)
    override fun deleteById(id: Int) {
        dsl.deleteFrom(UserConfirmationTable.TABLE)
            .where(UserConfirmationTable.CONFIRM_CODE.eq(id))
            .execute()
    }
}
