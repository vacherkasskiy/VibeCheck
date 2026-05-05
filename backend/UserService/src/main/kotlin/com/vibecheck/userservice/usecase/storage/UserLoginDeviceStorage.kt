package com.vibecheck.userservice.usecase.storage

import com.vibecheck.userservice.domain.auth.UserLoginDevice
import java.util.UUID

interface UserLoginDeviceStorage {
    fun existsByUserIdAndFingerprint(userId: UUID, fingerprint: String): Boolean

    fun create(userLoginDevice: UserLoginDevice): UserLoginDevice
}
