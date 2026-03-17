package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.UserPreregistration

interface UserPreregistrationStorage {
    fun findById(id: Int): UserPreregistration

    fun create(userPreregistration: UserPreregistration)

    fun deleteById(id: Int)
}