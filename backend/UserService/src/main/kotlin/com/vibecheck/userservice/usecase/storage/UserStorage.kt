package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.domain.exception.NotFoundException
import jakarta.persistence.Id
import java.util.UUID

interface UserStorage {
    fun findById(userId: UUID): User
    fun findAllByIds(userIds: Set<UUID>): List<User>
    fun findByEmail(email: String): User?
    fun findByEmailOrThrow(email: String): User =
        findByEmail(email) ?: throw NotFoundException("User $email not found")
    fun existsById(id: UUID): Boolean
    fun create(user: User): User
    fun update(user: User) : User
}
