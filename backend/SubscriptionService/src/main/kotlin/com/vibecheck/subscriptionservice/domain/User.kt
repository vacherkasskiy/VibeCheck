package com.vibecheck.subscriptionservice.domain

import java.util.UUID

data class User(
    val id: UUID,
    val email: String,
    val roles: List<UserRole>
)