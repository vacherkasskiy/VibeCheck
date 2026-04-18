package com.vibecheck.userservice.adapters.postgres.entity

import com.vibecheck.userservice.domain.Avatar
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.Version
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant

@Entity
@Table(name = "avatars")
class AvatarEntity {
    @Id
    var id: String? = null

    @Version
    var version: Int? = null

    @Column(name = "url", nullable = false)
    var url: String? = null

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    var createdAt: Instant? = null

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    var updatedAt: Instant? = null

    fun toEntity(avatar: Avatar): AvatarEntity = apply {
        id = avatar.id
        version = takeIf { avatar.version != 0 }?.let { avatar.version }
        url = avatar.url
    }

    fun toDomain(): Avatar = Avatar(
        requireNotNull(this.id),
        requireNotNull(this.version),
        requireNotNull(this.url),
    )
}

fun Avatar.toEntity(): AvatarEntity = AvatarEntity().toEntity(this)