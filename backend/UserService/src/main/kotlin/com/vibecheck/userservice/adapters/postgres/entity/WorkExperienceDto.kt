package com.vibecheck.userservice.adapters.postgres.entity

import com.fasterxml.jackson.annotation.JsonInclude
import com.vibecheck.userservice.domain.Speciality
import com.vibecheck.userservice.domain.WorkExperience
import java.time.Instant

@JsonInclude(JsonInclude.Include.NON_NULL)
data class WorkExperienceDto(
    val specialization: Speciality,
    val startedAt: Instant,
    val finishedAt: Instant?,
) {
    fun toDomain(): WorkExperience = WorkExperience(
        speciality = specialization,
        startedAt = startedAt,
        endedAt = finishedAt,
    )
}

fun WorkExperience.toDto(): WorkExperienceDto = WorkExperienceDto(
    specialization = speciality,
    startedAt = startedAt,
    finishedAt = endedAt
)