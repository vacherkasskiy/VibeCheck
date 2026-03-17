package com.vibecheck.subscriptionservice.security.token

import com.vibecheck.userservice.domain.User
import java.util.UUID

interface AccessTokenService {
    fun generate(user: User, sessionId: UUID): String
    fun parseAndValidate(token: String): AccessTokenClaims
}