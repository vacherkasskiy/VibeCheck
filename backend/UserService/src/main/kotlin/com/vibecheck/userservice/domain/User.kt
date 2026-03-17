package com.vibecheck.userservice.domain

import java.util.UUID

data class User(
    val id: UUID,
    val version: Int,
    val email: String,
    val password: String,
    val roles: List<UserRole>,
    val isBanned: Boolean,
) {
    fun ban(): User = copy(isBanned = true)

    fun unban(): User = copy(isBanned = false)

    companion object {
        fun new(
            id: UUID,
            email: String,
            password: String,
            roles: List<UserRole>
        ): User = User(
            id = id,
            version = 0,
            email = email,
            password = password,
            roles = roles,
            isBanned = false
        )
    }
}