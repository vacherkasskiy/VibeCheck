package com.vibecheck.userservice.adapters.rest

import com.vibecheck.userservice.adapters.rest.dto.EmailAuthRequest
import com.vibecheck.userservice.adapters.rest.dto.JwtTokensDto
import com.vibecheck.userservice.adapters.rest.dto.toDto
import com.vibecheck.userservice.usecase.EmailRegistrationConfirmation
import com.vibecheck.userservice.usecase.EmailUserRegistration
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/auth")
class AuthController(
    private val emailUserRegistration: EmailUserRegistration,
    private val emailRegistrationConfirmation: EmailRegistrationConfirmation,
) {
    @PostMapping("/email/register")
    fun registerWithEmail(@RequestBody emailAuthRequest: EmailAuthRequest) {
        emailUserRegistration.register(emailAuthRequest.login, emailAuthRequest.password)
    }

    @PostMapping("/email/register/confirm")
    fun confirmEmailRegistration(confirmCode: Int): JwtTokensDto {
        return emailRegistrationConfirmation.confirm(confirmCode).toDto()
    }
}