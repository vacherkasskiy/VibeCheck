package com.vibecheck.userservice.adapters.rest

import com.vibecheck.userservice.domain.exception.BadRequestException
import com.vibecheck.userservice.domain.exception.InternalTokenException
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.domain.exception.UnauthenticatedException
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler

@ControllerAdvice
class ApiExceptionHandler {

    @ExceptionHandler(BadRequestException::class)
    fun handleBadRequest(e: BadRequestException): ResponseEntity<ErrorResponse> =
        ResponseEntity.badRequest().body(ErrorResponse(e.message))

    @ExceptionHandler(NotFoundException::class)
    fun handleNotFoundException(e: NotFoundException): ResponseEntity<ErrorResponse> =
        ResponseEntity.notFound().build()

    @ExceptionHandler(UnauthenticatedException::class)
    fun handleUnauthenticatedException(e: UnauthenticatedException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(401).body(ErrorResponse(e.message ?: "User is not authenticated"))

    @ExceptionHandler(InternalTokenException::class)
    fun handleInternalTokenException(e: InternalTokenException): ResponseEntity<ErrorResponse> =
        ResponseEntity.internalServerError().body(ErrorResponse(e.message ?: "Internal token error"))

    @ExceptionHandler(Exception::class)
    fun handleException(e: Exception): ResponseEntity<ErrorResponse> =
        ResponseEntity.internalServerError().body(ErrorResponse(e.message ?: "Unknown error occurred")).also {
            e.printStackTrace()
        }

    data class ErrorResponse(
        val message: String
    )
}
