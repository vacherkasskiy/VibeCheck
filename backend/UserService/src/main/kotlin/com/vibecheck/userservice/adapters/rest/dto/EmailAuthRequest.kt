package com.vibecheck.userservice.adapters.rest.dto

data class EmailAuthRequest(
    val login: String,
    val password: String,
){
}