package com.vibecheck.userservice.security.session

import com.vibecheck.userservice.domain.User
import java.util.UUID

data class RefreshRotationResult(
    val user: User,
    val sessionId: UUID,
    val newRefreshToken: String
)