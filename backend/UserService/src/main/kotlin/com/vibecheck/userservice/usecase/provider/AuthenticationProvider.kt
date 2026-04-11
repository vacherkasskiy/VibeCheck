package com.vibecheck.userservice.usecase.provider

import com.vibecheck.userservice.domain.User

interface AuthenticationProvider {
    fun authenticate(username: String, password: String): User
}