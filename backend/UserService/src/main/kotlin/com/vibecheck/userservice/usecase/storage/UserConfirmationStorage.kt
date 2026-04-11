package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.UserConfirmation

interface UserConfirmationStorage {
    fun findById(id: Int): UserConfirmation

    fun create(userConfirmation: UserConfirmation)

    fun deleteById(id: Int)
}