package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.adapters.postgres.entity.toEntity
import com.vibecheck.userservice.adapters.postgres.repository.UserLoginDeviceRepository
import com.vibecheck.userservice.domain.auth.UserLoginDevice
import com.vibecheck.userservice.domain.exception.DuplicateUserLoginDeviceException
import com.vibecheck.userservice.usecase.storage.UserLoginDeviceStorage
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@Repository
class UserLoginDeviceStorageImpl(
    private val userLoginDeviceRepository: UserLoginDeviceRepository,
) : UserLoginDeviceStorage {
    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(userLoginDevice: UserLoginDevice): UserLoginDevice {
        try {
            return userLoginDeviceRepository.saveAndFlush(userLoginDevice.toEntity()).toDomain()
        } catch (_: DataIntegrityViolationException) {
            throw DuplicateUserLoginDeviceException(
                "Login device ${userLoginDevice.fingerprint} for user ${userLoginDevice.userId} already exists"
            )
        }
    }
}
