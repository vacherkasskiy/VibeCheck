package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.auth.RefreshToken
import java.util.UUID

interface RefreshTokenStorage {
    fun findById(tokenId: String): RefreshToken

    fun findAllByUserId(userId: UUID): List<RefreshToken>

    fun create(refreshToken: RefreshToken): RefreshToken

    fun updateAll(refreshTokens: Collection<RefreshToken>): List<RefreshToken>
}