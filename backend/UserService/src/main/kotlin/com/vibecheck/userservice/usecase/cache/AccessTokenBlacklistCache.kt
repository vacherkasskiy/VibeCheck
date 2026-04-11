package com.vibecheck.userservice.usecase.cache

import java.util.UUID

interface AccessTokenBlacklistCache {
    fun put(tokenId: String)
    fun put(userId: UUID)
    fun isExists(tokenId: String): Boolean
    fun isExists(userId: UUID): Boolean
}