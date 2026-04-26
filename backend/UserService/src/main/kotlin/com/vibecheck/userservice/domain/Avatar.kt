package com.vibecheck.userservice.domain

data class Avatar(
    val id: String,
    val version: Int,
    val url: String,
) {
    companion object {
        fun new(id: String, url: String): Avatar = Avatar(id = id, version = 0, url = url)
    }
}
