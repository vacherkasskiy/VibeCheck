package com.vibecheck.userservice.adapters.rest.dto

import com.vibecheck.userservice.usecase.JwtTokens

data class JwtTokensDto(
    val accessToken: String,
    val refreshToken: String,
)

fun JwtTokens.toDto(): JwtTokensDto = JwtTokensDto(
    accessToken = this.accessToken,
    refreshToken = this.refreshToken
)
