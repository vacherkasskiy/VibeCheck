package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.Avatar
import com.vibecheck.userservice.usecase.storage.AvatarStorage
import org.springframework.stereotype.Service

@Service
class AvatarSelection(
    private var avatarStorage: AvatarStorage
) {
    fun selectAll(): List<Avatar> = avatarStorage.findAll()
}