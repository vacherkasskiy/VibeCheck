package com.vibecheck.userservice.adapters.rest

import com.vibecheck.userservice.adapters.rest.auth.AuthProvider
import com.vibecheck.userservice.adapters.rest.dto.CreateUserReportDto
import com.vibecheck.userservice.adapters.rest.dto.CreateOrUpdateUserInfoDto
import com.vibecheck.userservice.adapters.rest.dto.UserInfoDto
import com.vibecheck.userservice.adapters.rest.dto.toDto
import com.vibecheck.userservice.usecase.ProfileReportCreation
import com.vibecheck.userservice.usecase.UserInfoCreation
import com.vibecheck.userservice.usecase.UserInfoSelection
import com.vibecheck.userservice.usecase.UserInfoUpdating
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/users")
class UserController(
    private val userInfoSelection: UserInfoSelection,
    private val userInfoCreation: UserInfoCreation,
    private val userInfoUpdating: UserInfoUpdating,
    private val profileReportCreation: ProfileReportCreation,
    private val authProvider: AuthProvider,
) {
    @GetMapping("/me/info")
    fun getUserInfo(): UserInfoDto {
        val userId = authProvider.getUserId()
        return userInfoSelection.select(userId).toDto()
    }

    @GetMapping("/{userId}/info")
    fun getUserInfo(@PathVariable userId: UUID): UserInfoDto =
        userInfoSelection.select(userId).toDto()

    @PostMapping("/info")
    fun createUserInfo(@RequestBody createOrUpdateUserInfoDto: CreateOrUpdateUserInfoDto) {
        val userId = authProvider.getUserId()
        userInfoCreation.create(userId, createOrUpdateUserInfoDto.toDomain())
    }

    @PutMapping("/info")
    fun updateUserInfo(@RequestBody createOrUpdateUserInfoDto: CreateOrUpdateUserInfoDto): UserInfoDto {
        val userId = authProvider.getUserId()
        return userInfoUpdating.update(userId, createOrUpdateUserInfoDto.toDomain()).toDto()
    }

    @PostMapping("/{userId}/reports")
    fun createReport(
        @PathVariable userId: UUID,
        @Valid @RequestBody dto: CreateUserReportDto,
    ) {
        profileReportCreation.create(
            targetUserId = userId,
            reportId = dto.reportId,
            reporterUserId = authProvider.getUserId(),
            reasonType = dto.reasonType,
            reasonText = dto.reasonText,
        )
    }
}
