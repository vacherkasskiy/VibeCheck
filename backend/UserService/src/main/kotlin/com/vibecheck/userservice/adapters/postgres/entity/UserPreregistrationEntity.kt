package com.vibecheck.userservice.adapters.postgres.entity

import com.vibecheck.userservice.domain.UserPreregistration
import com.vibecheck.userservice.domain.UserProfile
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant

@Entity
@Table(name = "user_preregistration")
class UserPreregistrationEntity {
    @Id
    var confirmCode: Int? = null

    @Column(nullable = false)
    var email: String? = null

    @Column(nullable = false)
    var password: String? = null

    @Column(name = "expired_at", nullable = false,)
    var expiredAt: Instant? = null

    @CreationTimestamp
    var createdAt: Instant? = null

    @UpdateTimestamp
    var updatedAt: Instant? = null

    fun toEntity(domain: UserPreregistration): UserPreregistrationEntity = apply {
        confirmCode = domain.confirmCode
        email = domain.email
        password = domain.password
        expiredAt = domain.expiredAt
    }

    fun toDomain(): UserPreregistration = UserPreregistration(
        confirmCode = requireNotNull(confirmCode),
        email = requireNotNull(email),
        password = requireNotNull(password),
        expiredAt = requireNotNull(expiredAt),
    )
}

fun UserPreregistration.toEntity(): UserPreregistrationEntity = UserPreregistrationEntity().toEntity(this)