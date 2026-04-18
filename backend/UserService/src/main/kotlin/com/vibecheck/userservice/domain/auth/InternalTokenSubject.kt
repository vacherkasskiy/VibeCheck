package com.vibecheck.userservice.domain.auth

import com.vibecheck.userservice.domain.UserRole
import java.util.UUID

data class InternalTokenSubject(
    val userId: UUID,
    val roles: List<UserRole>,
    val isBanned: Boolean,
)
