package com.vibecheck.userservice.domain.events

import java.time.Instant
import java.util.UUID

data class NewLoginDeviceDetectedEvent(
    val userId: UUID,
    val email: String,
    val userAgent: String,
    val ipAddress: String?,
    val loggedAt: Instant,
)
