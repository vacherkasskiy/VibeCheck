package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.entity.toEntity
import com.vibecheck.userservice.adapters.postgres.repository.UserRepository
import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.usecase.storage.UserStorage
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
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

    override fun findByEmail(email: String): User? =
        userRepository.findByEmail(email)
            ?.toDomain()

    override fun existsById(id: UUID): Boolean =
        userRepository.existsById(id)

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(user: User): User =
        userRepository.save(user.toEntity()).toDomain()

    @Transactional(propagation = Propagation.MANDATORY)
    override fun update(user: User): User {
        if (!userRepository.existsById(user.id)) {
            throw NotFoundException("User ${user.id} not found")
        }

        return userRepository.save(user.toEntity()).toDomain()
    }

    override fun findAllByIds(userIds: Set<UUID>): List<User> {
        if (userIds.isEmpty()) {
            return emptyList()
        }

        return userRepository.findAllById(userIds).map { it.toDomain() }
    }
}
