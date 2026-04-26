package com.vibecheck.userservice.adapters.rest.auth

import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AuthProvider {
    fun getUserId(): UUID {
        val authentication = SecurityContextHolder.getContext().authentication
        val jwtAuth = authentication as JwtAuthenticationToken
        val userId = jwtAuth.token.subject

        return UUID.fromString(userId)
    }

    fun extractAccessToken(request: HttpServletRequest): String {
        val header = request.getHeader("Authorization")
            ?: throw IllegalArgumentException("Missing Authorization header")

        if (!header.startsWith("Bearer ")) {
            throw IllegalArgumentException("Invalid Authorization header")
        }

        return header.removePrefix("Bearer ").trim()
    }
}