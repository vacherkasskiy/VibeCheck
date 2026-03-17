package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.repository.UserRepository
import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.usecase.storage.UserStorage
import org.springframework.stereotype.Repository
import java.util.UUID
import kotlin.jvm.optionals.getOrNull

@Repository
class UserStorageImpl(
    private val userRepository: UserRepository
): UserStorage {
    override fun findById(userId: UUID): User =
        userRepository.findById(userId)
            .getOrNull()
            ?.toDomain()
            ?: throw NotFoundException("User $userId is not found")
}