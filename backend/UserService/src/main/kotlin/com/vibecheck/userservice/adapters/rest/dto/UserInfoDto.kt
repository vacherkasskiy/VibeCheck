package com.vibecheck.userservice.adapters.rest.dto

import com.vibecheck.userservice.domain.Education
import com.vibecheck.userservice.domain.Sex
import com.vibecheck.userservice.domain.Speciality
import com.vibecheck.userservice.usecase.UserInfo
import java.time.Instant

data class UserInfoDto(
    val name: String,
    val iconId: String,
    val email: String,
    val sex: Sex,
    val birthday: Instant,
    val education: Education,
    val specialization: Speciality,
    val workExperience: List<WorkExperienceDto>
)

fun UserInfo.toDto(): UserInfoDto = UserInfoDto(
    name = profile.name,
    iconId = profile.avatarId,
    email = user.email,
    sex = profile.sex,
    birthday = profile.birthday,
    education = profile.education,
    specialization = profile.speciality,
    workExperience = profile.workExperience.map { it.toDto() }
)
