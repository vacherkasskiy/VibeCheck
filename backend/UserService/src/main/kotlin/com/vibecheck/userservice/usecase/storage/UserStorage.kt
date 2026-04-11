package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.domain.exception.NotFoundException
import java.util.UUID

interface UserStorage {
    fun findById(userId: UUID): User
    fun findByEmail(email: String): User?
    fun findByEmailOrThrow(email: String): User =
        findByEmail(email) ?: throw NotFoundException("User $email not found")
    fun create(user: User): User
}