package com.vibecheck.userservice.domain

import java.time.Instant

data class WorkExperience(
    val speciality: Speciality,
    val startedAt: Instant,
    val endedAt: Instant?,
) {
}
