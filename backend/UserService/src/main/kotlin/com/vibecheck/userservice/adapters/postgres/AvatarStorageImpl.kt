package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.repository.AvatarRepository
import com.vibecheck.userservice.domain.Avatar
import com.vibecheck.userservice.usecase.storage.AvatarStorage
import org.springframework.stereotype.Repository

@Repository
class AvatarStorageImpl(
    private val avatarRepository: AvatarRepository
): AvatarStorage {
    override fun existsById(id: String): Boolean =
        avatarRepository.existsById(id)

    override fun findAll(): List<Avatar> =
        avatarRepository.findAll().map { it.toDomain() }
}