package com.vibecheck.userservice.domain.events

data class EmailRegistrationIsConfirmedEvent(
    val email: String,
    val password: String,
) {
}