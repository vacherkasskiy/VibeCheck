package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.UserProfile
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.usecase.storage.AvatarStorage
import com.vibecheck.userservice.usecase.storage.UserProfileStorage
import org.springframework.cache.annotation.CachePut
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.util.*

@Service
class UserInfoCreation(
    private val userProfileStorage: UserProfileStorage,
    private val avatarStorage: AvatarStorage,
    private val transactionTemplate: TransactionTemplate
) {
    @CachePut(value = ["users.profiles"], key = "#userId")
    fun create(userId: UUID, createOrUpdateUserInfo: CreateOrUpdateUserInfo): Unit = with(createOrUpdateUserInfo) {
        if (!avatarStorage.existsById(avatarId)) {
            throw NotFoundException("Avatar id '${avatarId}' is not found");
        }
        val profile = UserProfile.new(
            userId = userId,
            name = name,
            sex = sex,
            avatarId = avatarId,
            birthday = birthday,
            education = education,
            speciality = speciality,
            workExperience = workExperience,
        )


        transactionTemplate.execute {
            userProfileStorage.create(profile)
        }

        //TODO add event publication in users topic
    }
}