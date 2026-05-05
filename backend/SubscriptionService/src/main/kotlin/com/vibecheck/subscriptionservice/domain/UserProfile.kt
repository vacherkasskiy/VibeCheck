package com.vibecheck.subscriptionservice.domain

import java.time.Instant
import java.util.UUID

data class UserProfile(
    val userId: UUID,
    val version: Int,
    val name: String,
    val avatarId: String,
    val sex: Sex,
    val birthday: Instant,
    val isDefault: Boolean = false,
) {
    companion object {
        fun default(userId: UUID): UserProfile = UserProfile(
            userId = userId,
            version = 0,
            name = "Unknown user",
            avatarId = "avatar1.png",
            sex = Sex.SEX_OTHER,
            birthday = Instant.EPOCH,
            isDefault = true,
        )
    }
}
