package com.vibecheck.userservice.usecase.validator

import com.vibecheck.userservice.domain.exception.BadRequestException
import org.springframework.stereotype.Service

@Service
class PasswordPolicyValidator {
    fun validate(password: String) {
        if (password.length < MIN_PASSWORD_LENGTH ||
            !UPPERCASE_REGEX.containsMatchIn(password) ||
            !LOWERCASE_REGEX.containsMatchIn(password) ||
            !DIGIT_REGEX.containsMatchIn(password) ||
            !SPECIAL_CHARACTER_REGEX.containsMatchIn(password)
        ) {
            throw BadRequestException(INVALID_PASSWORD_MESSAGE)
        }
    }

    companion object {
        private const val MIN_PASSWORD_LENGTH = 8
        private val UPPERCASE_REGEX = Regex("[A-Z]")
        private val LOWERCASE_REGEX = Regex("[a-z]")
        private val DIGIT_REGEX = Regex("\\d")
        private val SPECIAL_CHARACTER_REGEX = Regex("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]")

        const val INVALID_PASSWORD_MESSAGE =
            "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special character"
    }
}