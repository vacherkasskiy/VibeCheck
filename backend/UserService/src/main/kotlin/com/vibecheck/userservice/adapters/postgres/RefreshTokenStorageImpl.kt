package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.domain.auth.RefreshToken
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.domain.exception.OptimisticLockException
import com.vibecheck.userservice.usecase.storage.RefreshTokenStorage
import org.jooq.DSLContext
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Repository
class RefreshTokenStorageImpl(
    private val dsl: DSLContext,
    private val mapper: PostgresRecordMapper,
) : RefreshTokenStorage {
    override fun findById(tokenId: String): RefreshToken =
        selectRefreshToken()
            .where(RefreshTokenTable.TOKEN_ID.eq(tokenId))
            .fetchOne(mapper::toRefreshToken)
            ?: throw NotFoundException("Token not found")

    override fun findAllByUserId(userId: UUID): List<RefreshToken> =
        selectRefreshToken()
            .where(RefreshTokenTable.USER_ID.eq(userId))
            .orderBy(RefreshTokenTable.CREATED_AT.desc(), RefreshTokenTable.TOKEN_ID.asc())
            .fetch(mapper::toRefreshToken)

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(refreshToken: RefreshToken): RefreshToken =
        dsl.insertInto(RefreshTokenTable.TABLE)
            .set(RefreshTokenTable.TOKEN_ID, refreshToken.tokenId)
            .set(RefreshTokenTable.VERSION, refreshToken.version)
            .set(RefreshTokenTable.USER_ID, refreshToken.user.id)
            .set(RefreshTokenTable.TOKEN_HASH, refreshToken.tokenHash)
            .set(RefreshTokenTable.ISSUED_AT, refreshToken.issuedAt)
            .set(RefreshTokenTable.EXPIRES_AT, refreshToken.expiredAt)
            .set(RefreshTokenTable.REVOKED_AT, refreshToken.revokedAt)
            .set(RefreshTokenTable.CREATED_AT, refreshToken.createdAt)
            .execute()
            .let { findById(refreshToken.tokenId) }

    @Transactional(propagation = Propagation.MANDATORY)
    override fun updateAll(refreshTokens: Collection<RefreshToken>): List<RefreshToken> {
        if (refreshTokens.isEmpty()) {
            return emptyList()
        }

        val updateQueries = refreshTokens.map { refreshToken ->
            dsl.update(RefreshTokenTable.TABLE)
                .set(RefreshTokenTable.VERSION, refreshToken.version + 1)
                .set(RefreshTokenTable.USER_ID, refreshToken.user.id)
                .set(RefreshTokenTable.TOKEN_HASH, refreshToken.tokenHash)
                .set(RefreshTokenTable.ISSUED_AT, refreshToken.issuedAt)
                .set(RefreshTokenTable.EXPIRES_AT, refreshToken.expiredAt)
                .set(RefreshTokenTable.REVOKED_AT, refreshToken.revokedAt)
                .set(RefreshTokenTable.CREATED_AT, refreshToken.createdAt)
                .where(RefreshTokenTable.TOKEN_ID.eq(refreshToken.tokenId))
                .and(RefreshTokenTable.VERSION.eq(refreshToken.version))
        }

        val updatedRows = dsl.batch(updateQueries).execute()

        updatedRows.zip(refreshTokens).firstOrNull { (updated, _) -> updated == 0 }?.let { (_, refreshToken) ->
            throw OptimisticLockException("Token ${refreshToken.tokenId} has been modified concurrently")
        }

        val tokenIds = refreshTokens.map { it.tokenId }
        val updatedTokensById = selectRefreshToken()
            .where(RefreshTokenTable.TOKEN_ID.`in`(tokenIds))
            .fetch(mapper::toRefreshToken)
            .associateBy { it.tokenId }

        return tokenIds.map { tokenId ->
            updatedTokensById[tokenId]
                ?: error("Updated token $tokenId was not returned from database")
        }
    }

    private fun selectRefreshToken() =
        dsl.select(
            REFRESH_TOKEN_SELECT_FIELDS
        )
            .from(RefreshTokenTable.TABLE)
            .join(UsersTable.TABLE)
            .on(RefreshTokenTable.USER_ID.eq(UsersTable.ID))

    companion object {
        private val REFRESH_TOKEN_SELECT_FIELDS = listOf(
            RefreshTokenTable.TOKEN_ID,
            RefreshTokenTable.VERSION,
            RefreshTokenTable.USER_ID,
            RefreshTokenTable.TOKEN_HASH,
            RefreshTokenTable.ISSUED_AT,
            RefreshTokenTable.EXPIRES_AT,
            RefreshTokenTable.REVOKED_AT,
            RefreshTokenTable.CREATED_AT,
            UsersTable.ID,
            UsersTable.VERSION,
            UsersTable.EMAIL,
            UsersTable.PASSWORD,
            UsersTable.ROLES,
            UsersTable.IS_BANNED,
            UsersTable.CREATED_AT,
            UsersTable.UPDATED_AT,
        )
    }
}
