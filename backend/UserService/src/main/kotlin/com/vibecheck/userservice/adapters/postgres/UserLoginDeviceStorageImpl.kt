package com.vibecheck.userservice.adapters.postgres

import com.vibecheck.userservice.domain.auth.UserLoginDevice
import com.vibecheck.userservice.domain.exception.DuplicateUserLoginDeviceException
import com.vibecheck.userservice.usecase.storage.UserLoginDeviceStorage
import org.jooq.DSLContext
import org.jooq.exception.IntegrityConstraintViolationException
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Repository
class UserLoginDeviceStorageImpl(
    private val dsl: DSLContext,
    private val mapper: PostgresRecordMapper,
) : UserLoginDeviceStorage {
    @Transactional(propagation = Propagation.MANDATORY, readOnly = true)
    override fun existsByUserIdAndFingerprint(userId: UUID, fingerprint: String): Boolean {
        return dsl.fetchExists(
            dsl.selectOne()
                .from(UserLoginDeviceTable.TABLE)
                .where(UserLoginDeviceTable.USER_ID.eq(userId))
                .and(UserLoginDeviceTable.FINGERPRINT.eq(fingerprint))
        )
    }

    @Transactional(propagation = Propagation.MANDATORY)
    override fun create(userLoginDevice: UserLoginDevice): UserLoginDevice {
        try {
            return dsl.insertInto(UserLoginDeviceTable.TABLE)
                .set(UserLoginDeviceTable.USER_ID, userLoginDevice.userId)
                .set(UserLoginDeviceTable.FINGERPRINT, userLoginDevice.fingerprint)
                .set(UserLoginDeviceTable.USER_AGENT, userLoginDevice.userAgent)
                .set(UserLoginDeviceTable.IP_ADDRESS, userLoginDevice.ipAddress)
                .set(UserLoginDeviceTable.CREATED_AT, userLoginDevice.createdAt)
                .returning(
                    UserLoginDeviceTable.USER_ID,
                    UserLoginDeviceTable.FINGERPRINT,
                    UserLoginDeviceTable.USER_AGENT,
                    UserLoginDeviceTable.IP_ADDRESS,
                    UserLoginDeviceTable.CREATED_AT,
                )
                .fetchOne(mapper::toUserLoginDevice)
                ?: error("Failed to insert user login device")
        } catch (_: IntegrityConstraintViolationException) {
            throw DuplicateUserLoginDeviceException(
                "Login device ${userLoginDevice.fingerprint} for user ${userLoginDevice.userId} already exists"
            )
        }
    }
}
