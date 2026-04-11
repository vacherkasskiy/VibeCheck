package com.vibecheck.userservice.adapters.rest

import com.vibecheck.userservice.adapters.rest.auth.AuthProvider
import com.vibecheck.userservice.adapters.rest.dto.EmailAuthRequest
import com.vibecheck.userservice.adapters.rest.dto.JwtTokensDto
import com.vibecheck.userservice.adapters.rest.dto.PasswordResetRequestDto
import com.vibecheck.userservice.adapters.rest.dto.RefreshRequestDto
import com.vibecheck.userservice.adapters.rest.dto.toDto
import com.vibecheck.userservice.usecase.EmailRegistrationConfirmation
import com.vibecheck.userservice.usecase.EmailUserAuthorization
import com.vibecheck.userservice.usecase.EmailUserRegistration
import com.vibecheck.userservice.usecase.TokenRefreshing
import com.vibecheck.userservice.usecase.UserLoggingOut
import com.vibecheck.userservice.usecase.UserPasswordReset
import com.vibecheck.userservice.usecase.UserPasswordResetConfirmation
import jakarta.servlet.http.HttpServletRequest
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/auth")
class AuthController(
    private val emailUserRegistration: EmailUserRegistration,
    private val emailRegistrationConfirmation: EmailRegistrationConfirmation,
    private val emailUserAuthorization: EmailUserAuthorization,
    private val userRefreshing: TokenRefreshing,
    private val userLoggingOut: UserLoggingOut,
    private val userPasswordReset: UserPasswordReset,
    private val userPasswordResetConfirmation: UserPasswordResetConfirmation,
    private val authProvider: AuthProvider,
) {
    @PostMapping("/email/register")
    fun registerWithEmail(@RequestBody emailAuthRequest: EmailAuthRequest) {
        emailUserRegistration.register(emailAuthRequest.login, emailAuthRequest.password)
    }

    @PostMapping("/email/login")
    fun login(@RequestBody emailAuthRequest: EmailAuthRequest): JwtTokensDto {
        return emailUserAuthorization.authorize(emailAuthRequest.login, emailAuthRequest.password).toDto()
    }

    @PostMapping("/email/register/confirm")
    fun confirmEmailRegistration(@RequestParam confirmCode: Int): JwtTokensDto {
        return emailRegistrationConfirmation.confirm(confirmCode).toDto()
    }

    @PostMapping("/refresh")
    fun refresh(
        @RequestBody refreshRequestDto: RefreshRequestDto,
    ): JwtTokensDto {
        return userRefreshing.refresh(refreshRequestDto.refreshToken).toDto()
    }

    @PostMapping("/logout")
    fun logout(request: HttpServletRequest) {
        val userId = authProvider.getUserId()
        val accessToken = authProvider.extractAccessToken(request)
        userLoggingOut.logout(userId, accessToken)
    }

    @PostMapping("/email/password/reset")
    fun resetPassword(@RequestBody dto: PasswordResetRequestDto) {
        userPasswordReset.reset(dto.email, dto.newPassword)
    }

    @PutMapping("/email/password/reset")
    fun confirmPasswordReset(@RequestParam confirmCode: Int): JwtTokensDto {
        return userPasswordResetConfirmation.confirm(confirmCode).toDto()
    }
}
