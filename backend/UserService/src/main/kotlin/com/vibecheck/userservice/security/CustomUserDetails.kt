package com.vibecheck.userservice.security

import com.vibecheck.userservice.domain.User
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

class CustomUserDetails(
    val user: User
) : UserDetails {

    override fun getAuthorities(): Collection<GrantedAuthority> {
        return user.roles.map { SimpleGrantedAuthority(it.name) }
    }

    override fun getPassword(): String = user.password

    override fun getUsername(): String = user.email

    override fun isEnabled(): Boolean = !user.isBanned

    override fun isAccountNonExpired(): Boolean = true

    override fun isAccountNonLocked(): Boolean = true

    override fun isCredentialsNonExpired(): Boolean = true
}
