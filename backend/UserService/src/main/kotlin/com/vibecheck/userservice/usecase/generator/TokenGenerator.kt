package com.vibecheck.userservice.usecase.generator

import com.vibecheck.userservice.domain.UserRole
import com.vibecheck.userservice.domain.auth.GeneratedToken
import java.util.UUID

interface TokenGenerator {
    fun generateAccessToken(userId: UUID, roles: List<UserRole>): GeneratedToken

    fun generateRefreshToken(userId: UUID): GeneratedToken
}