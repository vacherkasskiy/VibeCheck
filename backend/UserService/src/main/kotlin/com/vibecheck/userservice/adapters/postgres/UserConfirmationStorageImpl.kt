package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.entity.toEntity
import com.vibecheck.userservice.adapters.postgres.repository.UserConfirmationRepository
import com.vibecheck.userservice.domain.UserConfirmation
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.usecase.storage.UserConfirmationStorage
import org.springframework.stereotype.Repository
import kotlin.jvm.optionals.getOrNull

@Repository
class UserConfirmationStorageImpl(
    private val userConfirmationRepository: UserConfirmationRepository
): UserConfirmationStorage {
    override fun findById(id: Int): UserConfirmation =
        userConfirmationRepository.findById(id).getOrNull()
            ?.toDomain()
            ?: throw NotFoundException("UserPreregistration not found")

    override fun create(userConfirmation: UserConfirmation) {
        userConfirmationRepository.saveAndFlush(userConfirmation.toEntity())
    }

    override fun deleteById(id: Int) {
        userConfirmationRepository.deleteById(id)
    }
}