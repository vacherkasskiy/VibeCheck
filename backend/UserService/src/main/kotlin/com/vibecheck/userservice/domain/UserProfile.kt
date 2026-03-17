package com.vibecheck.userservice.domain

import java.time.Instant
import java.util.UUID

data class UserProfile(
    val userId: UUID,
    val version: Int,
    val name: String,
    val avatarId: String,
    val sex: Sex,
    val birthday: Instant,
    val education: Education,
    val speciality: Speciality,
    var workExperience: List<WorkExperience>
) {
    init {
        workExperience = workExperience.sortedBy { it.startedAt }
    }

    fun update(
        name: String? = null,
        avatarId: String? = null,
        sex: Sex? = null,
        birthday: Instant? = null,
        education: Education? = null,
        speciality: Speciality? = null,
        workExperience: List<WorkExperience>? = null
    ): UserProfile = copy(
        userId = this.userId,
        version = this.version,
        name = name ?: this.name,
        sex = sex ?: this.sex,
        avatarId = avatarId ?: this.avatarId,
        birthday = birthday ?: this.birthday,
        education = education ?: this.education,
        speciality = speciality ?: this.speciality,
        workExperience = workExperience ?: this.workExperience
    )

    companion object {
        fun new(
            userId: UUID,
            name: String,
            sex: Sex,
            avatarId: String,
            birthday: Instant,
            education: Education,
            speciality: Speciality,
            workExperience: List<WorkExperience>
        ): UserProfile =
            UserProfile(
                userId = userId,
                version = 0,
                name = name,
                sex = sex,
                avatarId = avatarId,
                birthday = birthday,
                education = education,
                speciality = speciality,
                workExperience = workExperience
            )
    }
}
