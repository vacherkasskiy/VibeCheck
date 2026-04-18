package com.vibecheck.userservice.adapters.rest

import com.vibecheck.userservice.adapters.rest.auth.AuthProvider
import com.vibecheck.userservice.adapters.rest.dto.EmailAuthRequest
import com.vibecheck.userservice.adapters.rest.dto.InternalEmployeeAuthRequestDto
import com.vibecheck.userservice.adapters.rest.dto.InternalEmployeeAuthTokensDto
import com.vibecheck.userservice.adapters.rest.dto.InternalTokenRequestDto
import com.vibecheck.userservice.adapters.rest.dto.InternalTokenResponseDto
import com.vibecheck.userservice.adapters.rest.dto.JwtTokensDto
import com.vibecheck.userservice.adapters.rest.dto.PasswordResetRequestDto
import com.vibecheck.userservice.adapters.rest.dto.RefreshRequestDto
import com.vibecheck.userservice.adapters.rest.dto.toDto
import com.vibecheck.userservice.usecase.EmailRegistrationConfirmation
import com.vibecheck.userservice.usecase.InternalEmployeeAuthorization
import com.vibecheck.userservice.usecase.EmailUserAuthorization
import com.vibecheck.userservice.usecase.EmailUserRegistration
import com.vibecheck.userservice.usecase.InternalTokenGeneration
import com.vibecheck.userservice.usecase.LoginContext
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
    private val internalEmployeeAuthorization: InternalEmployeeAuthorization,
    private val userRefreshing: TokenRefreshing,
    private val userLoggingOut: UserLoggingOut,
    private val userPasswordReset: UserPasswordReset,
    private val userPasswordResetConfirmation: UserPasswordResetConfirmation,
    private val internalTokenGeneration: InternalTokenGeneration,
    private val authProvider: AuthProvider,
) {
    @PostMapping("/email/register")
    fun registerWithEmail(@RequestBody emailAuthRequest: EmailAuthRequest) {
        emailUserRegistration.register(emailAuthRequest.login, emailAuthRequest.password)
    }

    @PostMapping("/email/login")
    fun login(request: HttpServletRequest, @RequestBody emailAuthRequest: EmailAuthRequest): JwtTokensDto {
        return emailUserAuthorization.authorize(
            email = emailAuthRequest.login,
            password = emailAuthRequest.password,
            loginContext = request.toLoginContext(),
        ).toDto()
    }

    @PostMapping("/internal/login")
    fun internalLogin(
        request: HttpServletRequest,
        @RequestBody authRequest: InternalEmployeeAuthRequestDto,
    ): InternalEmployeeAuthTokensDto {
        val tokens = internalEmployeeAuthorization.authorize(
            email = authRequest.login,
            password = authRequest.password,
            audiences = authRequest.audiences,
            loginContext = request.toLoginContext(),
        )

        return InternalEmployeeAuthTokensDto(
            accessToken = tokens.accessToken,
            internalToken = tokens.internalToken,
        )
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

    @PostMapping("/internal")
    fun generateInternalToken(@RequestBody request: InternalTokenRequestDto): InternalTokenResponseDto =
        InternalTokenResponseDto(token = internalTokenGeneration.generate(request.audiences).token)

    private fun HttpServletRequest.toLoginContext(): LoginContext =
        LoginContext(
            userAgent = getHeader(USER_AGENT_HEADER),
            ipAddress = extractClientIp(),
        )

    private fun HttpServletRequest.extractClientIp(): String? {
        val forwardedFor = getHeader(X_FORWARDED_FOR_HEADER)
            ?.split(',')
            ?.firstOrNull()
            ?.trim()
            ?.takeIf { it.isNotBlank() }

        return forwardedFor ?: remoteAddr?.takeIf { it.isNotBlank() }
    }

    companion object {
        private const val USER_AGENT_HEADER = "User-Agent"
        private const val X_FORWARDED_FOR_HEADER = "X-Forwarded-For"
    }
}
