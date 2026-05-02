package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.domain.exception.OptimisticLockException
import com.vibecheck.userservice.usecase.storage.UserStorage
import org.jooq.DSLContext
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.time.Clock
import java.time.Instant
import java.util.UUID

@Repository
class UserStorageImpl(
    private val dsl: DSLContext,
    private val mapper: PostgresRecordMapper,
    private val clock: Clock
) : UserStorage {
    override fun existsAny(): Boolean =
        dsl.fetchExists(
            dsl.selectOne()
                .from(UsersTable.TABLE)
                .limit(1)
        )

    override fun findById(userId: UUID): User =
        dsl.selectFrom(UsersTable.TABLE)
            .where(UsersTable.ID.eq(userId))
            .fetchOne(mapper::toUser)
            ?: throw NotFoundException("User $userId is not found")

    override fun findByEmail(email: String): User? =
        dsl.selectFrom(UsersTable.TABLE)
            .where(UsersTable.EMAIL.eq(email))
            .fetchOne(mapper::toUser)

    override fun existsById(id: UUID): Boolean =
        dsl.fetchExists(
            dsl.selectOne()
                .from(UsersTable.TABLE)
                .where(UsersTable.ID.eq(id))
        )

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(user: User): User {
        val now = clock.instant()

        return dsl.insertInto(UsersTable.TABLE)
            .set(UsersTable.ID, user.id)
            .set(UsersTable.VERSION, user.version)
            .set(UsersTable.EMAIL, user.email)
            .set(UsersTable.PASSWORD, user.password)
            .set(UsersTable.ROLES, mapper.toJsonb(user.roles))
            .set(UsersTable.IS_BANNED, user.isBanned)
            .set(UsersTable.CREATED_AT, now)
            .set(UsersTable.UPDATED_AT, now)
            .returning(
                UsersTable.ID,
                UsersTable.VERSION,
                UsersTable.EMAIL,
                UsersTable.PASSWORD,
                UsersTable.ROLES,
                UsersTable.IS_BANNED,
            )
            .fetchOne(mapper::toUser)
            ?: error("Failed to create user ${user.id}")
    }

    @Transactional(propagation = Propagation.MANDATORY)
    override fun update(user: User): User {
        return dsl.update(UsersTable.TABLE)
            .set(UsersTable.VERSION, user.version + 1)
            .set(UsersTable.EMAIL, user.email)
            .set(UsersTable.PASSWORD, user.password)
            .set(UsersTable.ROLES, mapper.toJsonb(user.roles))
            .set(UsersTable.IS_BANNED, user.isBanned)
            .set(UsersTable.UPDATED_AT, clock.instant())
            .where(UsersTable.ID.eq(user.id))
            .and(UsersTable.VERSION.eq(user.version))
            .returning(
                UsersTable.ID,
                UsersTable.VERSION,
                UsersTable.EMAIL,
                UsersTable.PASSWORD,
                UsersTable.ROLES,
                UsersTable.IS_BANNED,
            )
            .fetchOne(mapper::toUser)
            ?: throw OptimisticLockException("User ${user.id} has been modified concurrently")
    }
    override fun findAllByIds(userIds: Set<UUID>): List<User> {
        if (userIds.isEmpty()) {
            return emptyList()
        }

        return dsl.selectFrom(UsersTable.TABLE)
            .where(UsersTable.ID.`in`(userIds))
            .fetch(mapper::toUser)
    }
}
