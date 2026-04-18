package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.exception.BadRequestException
import com.vibecheck.userservice.usecase.generator.TokenIssuer
import com.vibecheck.userservice.usecase.provider.AuthenticationProvider
import com.vibecheck.userservice.usecase.provider.UserLoginDeviceProvider
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate

@Service
class EmailUserAuthorization(
    private val authenticationProvider: AuthenticationProvider,
    private val tokenIssuer: TokenIssuer,
    private val userLoginDeviceProvider: UserLoginDeviceProvider,
    private val transactionTemplate: TransactionTemplate
) {
    fun authorize(email: String, password: String, loginContext: LoginContext): JwtTokens {
        val user = authenticationProvider.authenticate(email, password)

        if (user.isBanned) {
            throw BadRequestException("Banned user ${user.id} is not allowed")
        }

        return transactionTemplate.execute {
            userLoginDeviceProvider.registerIfNew(user, loginContext)
            tokenIssuer.issue(user)
        }
    }
}
