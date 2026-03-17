package com.vibecheck.gatewayservice.exception

import com.vibecheck.gatewayservice.dto.ErrorResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.AuthenticationException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(InvalidTokenException::class)
    fun handleInvalidToken(ex: InvalidTokenException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(
                ErrorResponse(
                    code = "UNAUTHORIZED",
                    message = ex.message ?: "Invalid access token"
                )
            )
    }

    @ExceptionHandler(AuthenticationException::class)
    fun handleAuthentication(ex: AuthenticationException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(
                ErrorResponse(
                    code = "UNAUTHORIZED",
                    message = ex.message ?: "Authentication failed"
                )
            )
    }

    @ExceptionHandler(InternalServiceException::class)
    fun handleInternalService(ex: InternalServiceException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(ex.status)
            .body(
                ErrorResponse(
                    code = "INTERNAL_SERVICE_ERROR",
                    message = ex.message
                )
            )
    }

    @ExceptionHandler(Exception::class)
    fun handleOther(ex: Exception): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(
                ErrorResponse(
                    code = "INTERNAL_SERVER_ERROR",
                    message = ex.message ?: "Unexpected error"
                )
            )
    }
}