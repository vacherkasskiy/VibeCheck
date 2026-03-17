package com.vibecheck.userservice.security.session

interface RefreshTokenGenerator {
    fun generate(): String
}