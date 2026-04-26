package com.vibecheck.userservice.adapters.postgres.repository

import com.vibecheck.userservice.adapters.postgres.entity.UserLoginDeviceEntity
import com.vibecheck.userservice.adapters.postgres.entity.UserLoginDeviceEntityId
import org.springframework.data.jpa.repository.JpaRepository

interface UserLoginDeviceRepository : JpaRepository<UserLoginDeviceEntity, UserLoginDeviceEntityId>
