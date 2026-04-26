package com.vibecheck.userservice.domain

import java.time.Instant

data class UserConfirmation(
    val email: String,
    val password: String,
    val confirmCode: Int,
    val expiredAt: Instant,
) {
    fun isExpired(instant: Instant): Boolean = expiredAt.isBefore(instant)

    companion object {
        fun new(email: String, password: String, confirmCode: Int, expiredAt: Instant): UserConfirmation =
            UserConfirmation(email = email, password = password, confirmCode = confirmCode, expiredAt = expiredAt)
    }
}
