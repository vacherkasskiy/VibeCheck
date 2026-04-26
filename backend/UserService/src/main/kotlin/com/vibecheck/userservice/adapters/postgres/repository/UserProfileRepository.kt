package com.vibecheck.userservice.adapters.postgres.repository

import com.vibecheck.userservice.adapters.postgres.entity.UserProfileEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserProfileRepository: JpaRepository<UserProfileEntity, UUID> {

}