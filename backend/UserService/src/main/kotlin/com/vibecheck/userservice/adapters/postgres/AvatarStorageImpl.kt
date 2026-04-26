package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.entity.toEntity
import com.vibecheck.userservice.adapters.postgres.repository.AvatarRepository
import com.vibecheck.userservice.domain.Avatar
import com.vibecheck.userservice.usecase.storage.AvatarStorage
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import kotlin.jvm.optionals.getOrNull

@Repository
class AvatarStorageImpl(
    private val avatarRepository: AvatarRepository
): AvatarStorage {
    override fun existsById(id: String): Boolean =
        avatarRepository.existsById(id)

    override fun findAll(): List<Avatar> =
        avatarRepository.findAll().map { it.toDomain() }

    override fun findById(id: String): Avatar? {
        return avatarRepository.findById(id).getOrNull()?.toDomain()
    }

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(avatar: Avatar) {
        avatarRepository.saveAndFlush(avatar.toEntity())
    }
}