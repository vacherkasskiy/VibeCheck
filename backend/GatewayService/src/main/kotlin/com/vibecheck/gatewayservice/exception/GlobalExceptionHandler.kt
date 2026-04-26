package com.vibecheck.gatewayservice.exception

import com.vibecheck.gatewayservice.dto.ErrorResponse
import com.vibecheck.gatewayservice.response.ErrorResponseMetadata
import org.springframework.http.HttpStatus
import org.springframework.http.HttpHeaders
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
            .header(HttpHeaders.CONTENT_TYPE, "application/json")
            .header(ErrorResponseMetadata.ERROR_SOURCE_HEADER, "gateway")
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
            .header(HttpHeaders.CONTENT_TYPE, "application/json")
            .header(ErrorResponseMetadata.ERROR_SOURCE_HEADER, "gateway")
            .body(
                ErrorResponse(
                    code = "UNAUTHORIZED",
                    message = ex.message ?: "Authentication failed"
                )
            )
    }

    @ExceptionHandler(Exception::class)
    fun handleOther(ex: Exception): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .header(HttpHeaders.CONTENT_TYPE, "application/json")
            .header(ErrorResponseMetadata.ERROR_SOURCE_HEADER, "gateway")
            .body(
                ErrorResponse(
                    code = "INTERNAL_SERVER_ERROR",
                    message = ex.message ?: "Unexpected error"
                )
            )
    }
}
