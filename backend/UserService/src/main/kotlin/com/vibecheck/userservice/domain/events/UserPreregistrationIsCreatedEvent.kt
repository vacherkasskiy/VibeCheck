package com.vibecheck.userservice.domain.events

data class UserPreregistrationIsCreatedEvent(
    val email: String,
    val confirmCode: Int
)
