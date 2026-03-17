package com.vibecheck.userservice.adapters.postgres.repository

import com.vibecheck.userservice.adapters.postgres.entity.UserPreregistrationEntity
import org.springframework.data.jpa.repository.JpaRepository

interface UserPreregistrationRepository: JpaRepository<UserPreregistrationEntity, Int> {
}