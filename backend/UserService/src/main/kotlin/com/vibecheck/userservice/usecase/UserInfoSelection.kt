package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.usecase.storage.UserProfileStorage
import com.vibecheck.userservice.usecase.storage.UserStorage
import org.springframework.stereotype.Service
import java.util.*

@Service
class UserInfoSelection(
    private val userStorage: UserStorage,
    private val userProfileStorage: UserProfileStorage,
) {
    fun select(userId: UUID): UserInfo {
        val user = userStorage.findById(userId)
        val profile = userProfileStorage.findById(userId)

        return UserInfo(
            user = user,
            profile = profile,
        )
    }
}
