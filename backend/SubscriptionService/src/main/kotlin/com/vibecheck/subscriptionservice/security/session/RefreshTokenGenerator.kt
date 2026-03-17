package com.vibecheck.subscriptionservice.security.session

interface RefreshTokenGenerator {
    fun generate(): String
}