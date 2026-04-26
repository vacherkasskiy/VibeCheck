package com.vibecheck.subscriptionservice.adapters.rest.auth

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AuthProviderImpl : AuthProvider {
    override fun getUserId(): UUID {
        val authentication = SecurityContextHolder.getContext().authentication as JwtAuthenticationToken
        return UUID.fromString(authentication.token.subject)
    }
}
