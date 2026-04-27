package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.entity.toEntity
import com.vibecheck.userservice.adapters.postgres.repository.RefreshTokenRepository
import com.vibecheck.userservice.adapters.postgres.repository.UserRepository
import com.vibecheck.userservice.domain.auth.RefreshToken
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.usecase.storage.RefreshTokenStorage
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.util.UUID
import kotlin.jvm.optionals.getOrNull

@Repository
class RefreshTokenStorageImpl(
    private val refreshTokenRepository: RefreshTokenRepository,
    private val userRepository: UserRepository,
) : RefreshTokenStorage {
    override fun findById(tokenId: String): RefreshToken =
        refreshTokenRepository.findById(tokenId)
            .getOrNull()
            ?.toDomain()
            ?: throw NotFoundException("Token not found")

    override fun findAllByUserId(userId: UUID): List<RefreshToken> =
        refreshTokenRepository.findAllByUserId(userId).map { it.toDomain() }


    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(refreshToken: RefreshToken): RefreshToken =
        refreshTokenRepository.saveAndFlush(refreshToken.toManagedEntity()).toDomain()

    @Transactional(propagation = Propagation.MANDATORY)
    override fun updateAll(refreshTokens: Collection<RefreshToken>): List<RefreshToken> {
        return refreshTokenRepository.saveAllAndFlush(
            refreshTokens.map { it.toManagedEntity() }
        ).map { it.toDomain() }
    }

    private fun RefreshToken.toManagedEntity() =
        toEntity().apply {
            user = userRepository.getReferenceById(this@toManagedEntity.user.id)
        }
}
