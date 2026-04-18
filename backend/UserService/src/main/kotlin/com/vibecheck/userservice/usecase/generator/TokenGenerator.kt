package com.vibecheck.userservice.usecase.generator

import com.vibecheck.userservice.domain.UserRole
import com.vibecheck.userservice.domain.auth.GeneratedToken
import java.util.UUID

interface TokenGenerator {
    fun generateAccessToken(userId: UUID, roles: List<UserRole>, isBanned: Boolean): GeneratedToken

    fun generateRefreshToken(userId: UUID): GeneratedToken

    fun generateInternalToken(userId: UUID, roles: List<UserRole>, isBanned: Boolean, audiences: List<String>): GeneratedToken
}
