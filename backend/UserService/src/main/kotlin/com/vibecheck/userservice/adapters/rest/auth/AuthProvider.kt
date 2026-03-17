package com.vibecheck.userservice.adapters.rest.auth

import java.util.UUID

interface AuthProvider {
    fun getUserId(): UUID
}