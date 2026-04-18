package com.vibecheck.userservice.adapters.postgres.repository

import com.vibecheck.userservice.adapters.postgres.entity.UserConfirmationEntity
import org.springframework.data.jpa.repository.JpaRepository

interface UserConfirmationRepository: JpaRepository<UserConfirmationEntity, Int> {
}