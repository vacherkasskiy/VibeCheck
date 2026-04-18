package com.vibecheck.userservice.adapters.postgres.entity

import com.vibecheck.userservice.domain.auth.UserLoginDevice
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.IdClass
import jakarta.persistence.Table
import java.io.Serializable
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "user_login_devices")
@IdClass(UserLoginDeviceEntityId::class)
class UserLoginDeviceEntity {
    @Id
    @Column(name = "user_id", nullable = false)
    var userId: UUID? = null

    @Id
    @Column(name = "fingerprint", nullable = false, length = 64)
    var fingerprint: String? = null

    @Column(name = "user_agent", nullable = false, length = 1024)
    var userAgent: String? = null

    @Column(name = "ip_address", length = 255)
    var ipAddress: String? = null

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant? = null

    fun toEntity(domain: UserLoginDevice): UserLoginDeviceEntity = apply {
        userId = domain.userId
        fingerprint = domain.fingerprint
        userAgent = domain.userAgent
        ipAddress = domain.ipAddress
        createdAt = domain.createdAt
    }

    fun toDomain(): UserLoginDevice = UserLoginDevice(
        userId = requireNotNull(userId),
        fingerprint = requireNotNull(fingerprint),
        userAgent = requireNotNull(userAgent),
        ipAddress = ipAddress,
        createdAt = requireNotNull(createdAt),
    )
}

data class UserLoginDeviceEntityId(
    var userId: UUID? = null,
    var fingerprint: String? = null,
) : Serializable

fun UserLoginDevice.toEntity(): UserLoginDeviceEntity = UserLoginDeviceEntity().toEntity(this)
