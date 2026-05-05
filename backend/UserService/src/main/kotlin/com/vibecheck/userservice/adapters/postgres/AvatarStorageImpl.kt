package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.domain.Avatar
import com.vibecheck.userservice.usecase.storage.AvatarStorage
import org.jooq.DSLContext
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.time.Clock
import java.time.Instant

@Repository
class AvatarStorageImpl(
    private val dsl: DSLContext,
    private val mapper: PostgresRecordMapper,
    private val clock: Clock
) : AvatarStorage {
    override fun existsById(id: String): Boolean =
        dsl.fetchExists(
            dsl.selectOne()
                .from(AvatarsTable.TABLE)
                .where(AvatarsTable.ID.eq(id))
        )

    override fun findAll(): List<Avatar> =
        dsl.selectFrom(AvatarsTable.TABLE)
            .fetch(mapper::toAvatar)

    override fun findById(id: String): Avatar? =
        dsl.selectFrom(AvatarsTable.TABLE)
            .where(AvatarsTable.ID.eq(id))
            .fetchOne(mapper::toAvatar)

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(avatar: Avatar) {
        val now = clock.instant()

        dsl.insertInto(AvatarsTable.TABLE)
            .set(AvatarsTable.ID, avatar.id)
            .set(AvatarsTable.VERSION, avatar.version)
            .set(AvatarsTable.URL, avatar.url)
            .set(AvatarsTable.CREATED_AT, now)
            .set(AvatarsTable.UPDATED_AT, now)
            .execute()
    }
}
