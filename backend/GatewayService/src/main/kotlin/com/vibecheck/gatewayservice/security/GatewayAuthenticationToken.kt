package com.vibecheck.gatewayservice.security

import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority

class GatewayAuthenticationToken(
    private val user: AuthenticatedUser
) : AbstractAuthenticationToken(
    emptyList<SimpleGrantedAuthority>()
) {

    init {
        isAuthenticated = true
    }

    override fun getCredentials(): Any = user.internalToken

    override fun getPrincipal(): Any = user
}
