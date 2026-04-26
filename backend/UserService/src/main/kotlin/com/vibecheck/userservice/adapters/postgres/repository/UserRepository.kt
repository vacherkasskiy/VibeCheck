package com.vibecheck.userservice.adapters.postgres.repository

import com.vibecheck.userservice.adapters.postgres.entity.UserEntity
import com.vibecheck.userservice.domain.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserRepository: JpaRepository<UserEntity, UUID> {
    fun findByEmail(email: String): UserEntity?
}