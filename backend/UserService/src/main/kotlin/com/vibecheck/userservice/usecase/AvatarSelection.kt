package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.adapters.minio.AvatarUrlProvider
import com.vibecheck.userservice.domain.Avatar
import com.vibecheck.userservice.usecase.storage.AvatarStorage
import org.springframework.stereotype.Service

@Service
class AvatarSelection(
    private var avatarStorage: AvatarStorage,
    private val avatarUrlProvider: AvatarUrlProvider,
) {
    fun selectAll(): List<Avatar> = avatarStorage.findAll().map { it.withPresignedUrl(avatarUrlProvider.getReadUrl(it.url)) }
}