package com.vibecheck.userservice.adapters.rest.dto

data class InternalEmployeeAuthRequestDto(
    val login: String,
    val password: String,
    val audiences: List<String>,
)
