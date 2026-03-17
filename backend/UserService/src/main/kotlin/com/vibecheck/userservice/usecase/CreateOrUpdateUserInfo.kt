package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.Education
import com.vibecheck.userservice.domain.Sex
import com.vibecheck.userservice.domain.Speciality
import com.vibecheck.userservice.domain.WorkExperience
import java.time.Instant

data class CreateOrUpdateUserInfo(
    val name: String,
    val sex: Sex,
    val birthday: Instant,
    val education: Education,
    val speciality: Speciality,
    val workExperience: List<WorkExperience>,
    val avatarId: String,
)
