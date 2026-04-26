package com.vibecheck.userservice.security

import com.vibecheck.userservice.usecase.storage.UserStorage
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class CustomUserDetailsService(
    private val userStorage: UserStorage
) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val user = userStorage.findByEmail(username)
            ?: throw UsernameNotFoundException(username)

        return CustomUserDetails(user)
    }
}