package com.vibecheck.userservice.usecase.generator

import com.vibecheck.userservice.usecase.JwtTokens

interface JwtTokenGenerator {
    fun generateTokens(): JwtTokens
}