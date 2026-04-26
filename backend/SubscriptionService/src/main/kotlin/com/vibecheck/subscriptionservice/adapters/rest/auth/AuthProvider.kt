package com.vibecheck.subscriptionservice.adapters.rest.auth

import java.util.UUID

interface AuthProvider {
    fun getUserId(): UUID
}