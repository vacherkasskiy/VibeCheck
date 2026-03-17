package com.vibecheck.userservice.adapters.postgres.entity

import com.vibecheck.userservice.domain.Education
import com.vibecheck.userservice.domain.Sex
import com.vibecheck.userservice.domain.Speciality
import com.vibecheck.userservice.domain.UserProfile
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
@Table(name = "user_profile")
class UserProfileEntity {
    @Id
    var userId: UUID? = null

    @Version
    var version: Int? = null

    @Column(nullable = false)
    var name: String? = null

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var sex: Sex? = null

    @Column(nullable = false)
    var birthday: Instant? = null

    @Column(name = "avatar_id", nullable = false)
    var avatarId: String? = null

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var education: Education? = null

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var speciality: Speciality? = null

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    var workExperience: List<WorkExperienceDto> ? = null

    @CreationTimestamp
    var createdAt: Instant? = null

    @UpdateTimestamp
    var updatedAt: Instant? = null

    fun toEntity(domain: UserProfile): UserProfileEntity = apply {
        userId = domain.userId
        name = domain.name
        sex = domain.sex
        birthday = domain.birthday
        education = domain.education
        speciality = domain.speciality
        avatarId = domain.avatarId
        workExperience = domain.workExperience.map { it.toDto() }
        version = takeIf { domain.version != 0 }?.let { domain.version }
    }

    fun toDomain(): UserProfile = UserProfile(
        userId = requireNotNull(userId),
        version = requireNotNull(this.version),
        name = requireNotNull(name),
        avatarId = requireNotNull(avatarId),
        sex = requireNotNull(sex),
        birthday = requireNotNull(birthday),
        education = requireNotNull(education),
        speciality = requireNotNull(speciality),
        workExperience = requireNotNull(workExperience).map { it.toDomain() }
    )
}

fun UserProfile.toEntity(): UserProfileEntity = UserProfileEntity().toEntity(this)