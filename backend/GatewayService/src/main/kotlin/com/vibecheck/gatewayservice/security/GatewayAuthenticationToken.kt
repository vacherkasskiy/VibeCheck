package com.vibecheck.gatewayservice.security

import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority

class GatewayAuthenticationToken(
    private val user: AuthenticatedUser
) : AbstractAuthenticationToken(
    user.roles.map { SimpleGrantedAuthority(it) }
) {

    init {
        isAuthenticated = true
    }

    override fun getCredentials(): Any = user.internalToken

    override fun getPrincipal(): Any = user
}