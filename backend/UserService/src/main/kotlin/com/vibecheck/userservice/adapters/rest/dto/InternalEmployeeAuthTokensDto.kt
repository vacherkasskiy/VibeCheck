package com.vibecheck.userservice.adapters.rest.dto

data class InternalEmployeeAuthTokensDto(
    val accessToken: String,
    val internalToken: String,
)
