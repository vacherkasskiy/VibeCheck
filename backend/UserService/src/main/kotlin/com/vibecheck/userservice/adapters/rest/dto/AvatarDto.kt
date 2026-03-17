package com.vibecheck.userservice.adapters.rest.dto

import com.vibecheck.userservice.domain.Avatar

data class AvatarDto(
    val iconId: String,
    val link: String
)

fun Avatar.toDto(): AvatarDto = AvatarDto(
    iconId = id,
    link = url
)
