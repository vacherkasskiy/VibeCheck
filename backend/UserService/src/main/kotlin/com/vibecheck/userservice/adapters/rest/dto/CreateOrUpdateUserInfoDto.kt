package com.vibecheck.userservice.adapters.rest.dto

import com.vibecheck.userservice.domain.Education
import com.vibecheck.userservice.domain.Sex
import com.vibecheck.userservice.domain.Speciality
import com.vibecheck.userservice.usecase.CreateOrUpdateUserInfo
import java.time.Instant

data class CreateOrUpdateUserInfoDto(
    val name: String,
    val iconId: String,
    val sex: Sex,
    val birthday: Instant,
    val education: Education,
    val specialization: Speciality,
    val workExperience: List<WorkExperienceDto>
) {
    fun toDomain(): CreateOrUpdateUserInfo = CreateOrUpdateUserInfo(
        name = name,
        sex = sex,
        birthday = birthday,
        education = education,
        speciality = specialization,
        workExperience = workExperience.map { it.toDomain() },
        avatarId = iconId
    )
}
