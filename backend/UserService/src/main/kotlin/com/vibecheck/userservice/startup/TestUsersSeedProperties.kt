package com.vibecheck.userservice.startup

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "user-service.test-users-seed")
data class TestUsersSeedProperties(
    val enabled: Boolean = false,
    val defaultPassword: String = "Test123!",
)
