package com.vibecheck.userservice.adapters.postgres.repository

import com.vibecheck.userservice.adapters.postgres.entity.AvatarEntity
import com.vibecheck.userservice.domain.Avatar
import org.springframework.data.jpa.repository.JpaRepository

interface AvatarRepository: JpaRepository<AvatarEntity, String> {
}