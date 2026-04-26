package com.vibecheck.gatewayservice.dto

data class ErrorResponse(
    val code: String,
    val message: String,
    val source: String = "gateway"
)
