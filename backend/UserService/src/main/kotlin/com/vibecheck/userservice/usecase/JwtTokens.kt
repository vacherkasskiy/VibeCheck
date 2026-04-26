package com.vibecheck.userservice.usecase

data class JwtTokens(
    val accessToken: String,
    val refreshToken: String
)
