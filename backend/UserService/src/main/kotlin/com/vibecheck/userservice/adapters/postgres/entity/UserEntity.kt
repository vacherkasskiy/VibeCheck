package com.vibecheck.userservice.adapters.postgres.entity

import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.domain.UserRole
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.Version
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.UpdateTimestamp
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.*

@Entity
@Table(name = "users")
class UserEntity {
    @Id
    var id: UUID? = null

    @Version
    var version: Int? = null

    @Column(nullable = false, unique = true)
    var email: String? = null

    @Column(nullable = false)
    var password: String? = null

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(nullable = false, columnDefinition = "jsonb")
    @Enumerated(EnumType.STRING)
    var roles: List<UserRole>? = null

    @Column(name = "is_banned", nullable = false)
    var isBanned: Boolean? = null

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    var createdAt: Instant? = null

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    var updatedAt: Instant? = null

    fun toEntity(user: User): UserEntity = apply {
        id = user.id
        email = user.email
        password = user.password
        roles = user.roles
        version = takeIf { user.version != 0 }?.let { user.version }
        isBanned = user.isBanned
    }

    fun toDomain(): User = User(
        id = requireNotNull(this.id),
        version = requireNotNull(this.version),
        email = requireNotNull(this.email),
        password = requireNotNull(this.password),
        roles = requireNotNull(roles),
        isBanned = requireNotNull(isBanned)
    )
}

fun User.toEntity(): UserEntity = UserEntity().toEntity(this)