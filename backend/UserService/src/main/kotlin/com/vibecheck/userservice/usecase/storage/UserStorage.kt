package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.User
import java.util.UUID

interface UserStorage {
    fun findById(userId: UUID): User
    fun create(user: User): User
}