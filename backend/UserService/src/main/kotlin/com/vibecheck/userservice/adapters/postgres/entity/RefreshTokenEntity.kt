package com.vibecheck.userservice.adapters.postgres.entity

import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.domain.auth.RefreshToken
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.Version
import org.hibernate.annotations.CreationTimestamp
import java.time.Instant

@Entity
@Table(name = "refresh_tokens")
class RefreshTokenEntity {
    @Id
    @Column(name = "token_id", nullable = false, length = 64)
    var tokenId: String? = null

    @Version
    var version: Int? = null

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    var user: UserEntity? = null

    @Column(name = "token_hash", nullable = false, length = 2048)
    var tokenHash: String? = null

    @Column(name = "issued_at", nullable = false)
    var issuedAt: Instant? = null

    @Column(name = "expires_at", nullable = false)
    var expiresAt: Instant? = null

    @Column(name = "revoked_at")
    var revokedAt: Instant? = null

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant? = null

    fun toEntity(domain: RefreshToken): RefreshTokenEntity = apply {
        tokenId = domain.tokenId
        version = domain.version.takeIf { it != 0 }
        user = UserEntity().apply { id = domain.user.id }
        tokenHash = domain.tokenHash
        issuedAt = domain.issuedAt
        expiresAt = domain.expiredAt
        revokedAt = domain.revokedAt
        createdAt = domain.createdAt
    }

    fun toDomain(): RefreshToken = RefreshToken(
        tokenId = requireNotNull(tokenId),
        version = requireNotNull(version),
        user = requireNotNull(user).toDomain(),
        tokenHash = requireNotNull(tokenHash),
        issuedAt = requireNotNull(issuedAt),
        expiredAt = requireNotNull(expiresAt),
        revokedAt = revokedAt,
        createdAt = requireNotNull(createdAt),
    )
}

fun RefreshToken.toEntity() = RefreshTokenEntity().toEntity(this)
