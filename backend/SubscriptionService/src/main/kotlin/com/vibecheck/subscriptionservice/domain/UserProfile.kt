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
) {
}
