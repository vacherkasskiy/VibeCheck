package com.vibecheck.userservice.domain.events

import java.util.UUID

data class UserPasswordResetEvent(
    val userId: UUID,
    val email: String,
    val confirmCode: Int,
) {
}