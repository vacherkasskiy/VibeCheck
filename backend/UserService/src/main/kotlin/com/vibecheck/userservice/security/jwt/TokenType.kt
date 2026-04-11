package com.vibecheck.userservice.security.jwt

enum class TokenType(val value: String) {
    ACCESS("access"),
    REFRESH("refresh")
}