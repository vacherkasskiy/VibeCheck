package com.vibecheck.userservice.adapters.rest

import com.vibecheck.userservice.adapters.rest.dto.AvatarDto
import com.vibecheck.userservice.adapters.rest.dto.toDto
import com.vibecheck.userservice.usecase.AvatarSelection
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/avatars")
class AvatarController(
    private val avatarSelection: AvatarSelection,
) {
    @GetMapping
    fun getAllAvatars(): List<AvatarDto> = avatarSelection.selectAll().map { it.toDto() }
}
