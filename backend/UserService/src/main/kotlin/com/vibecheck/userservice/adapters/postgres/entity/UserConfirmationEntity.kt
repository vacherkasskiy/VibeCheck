package com.vibecheck.userservice.adapters.postgres.entity

import com.vibecheck.userservice.domain.UserConfirmation
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant

@Entity
@Table(name = "user_confirmation")
class UserConfirmationEntity {
    @Id
    var confirmCode: Int? = null

    @Column(nullable = false)
    var email: String? = null

    @Column(nullable = false)
    var password: String? = null

    @Column(name = "expired_at", nullable = false)
    var expiredAt: Instant? = null

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    var createdAt: Instant? = null

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    var updatedAt: Instant? = null

    fun toEntity(domain: UserConfirmation): UserConfirmationEntity = apply {
        confirmCode = domain.confirmCode
        email = domain.email
        password = domain.password
        expiredAt = domain.expiredAt
    }

    fun toDomain(): UserConfirmation = UserConfirmation(
        confirmCode = requireNotNull(confirmCode),
        email = requireNotNull(email),
        password = requireNotNull(password),
        expiredAt = requireNotNull(expiredAt),
    )
}

fun UserConfirmation.toEntity(): UserConfirmationEntity = UserConfirmationEntity().toEntity(this)