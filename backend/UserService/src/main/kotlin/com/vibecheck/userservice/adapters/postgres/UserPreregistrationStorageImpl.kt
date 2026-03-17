package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.entity.toEntity
import com.vibecheck.userservice.adapters.postgres.repository.UserPreregistrationRepository
import com.vibecheck.userservice.domain.UserPreregistration
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.usecase.storage.UserPreregistrationStorage
import org.springframework.stereotype.Repository
import kotlin.jvm.optionals.getOrNull

@Repository
class UserPreregistrationStorageImpl(
    private val userPreregistrationRepository: UserPreregistrationRepository
): UserPreregistrationStorage {
    override fun findById(id: Int): UserPreregistration =
        userPreregistrationRepository.findById(id).getOrNull()
            ?.toDomain()
            ?: throw NotFoundException("UserPreregistration not found")

    override fun create(userPreregistration: UserPreregistration) {
        userPreregistrationRepository.saveAndFlush(userPreregistration.toEntity())
    }

    override fun deleteById(id: Int) {
        userPreregistrationRepository.deleteById(id)
    }
}