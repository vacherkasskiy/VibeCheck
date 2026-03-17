package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.domain.UserProfile

data class UserInfo(
    val user: User,
    val profile: UserProfile,
) {

}
