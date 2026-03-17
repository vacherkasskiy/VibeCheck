package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.Avatar

interface AvatarStorage {
    fun existsById(id: String): Boolean

    fun findAll(): List<Avatar>
}