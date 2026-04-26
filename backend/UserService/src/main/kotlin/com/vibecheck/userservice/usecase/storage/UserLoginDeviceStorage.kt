package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.auth.UserLoginDevice

interface UserLoginDeviceStorage {
    fun create(userLoginDevice: UserLoginDevice): UserLoginDevice
}
