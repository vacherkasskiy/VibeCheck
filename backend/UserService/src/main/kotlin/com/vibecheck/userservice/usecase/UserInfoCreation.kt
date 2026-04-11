package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.UserProfile
import com.vibecheck.userservice.domain.events.UserInfoCreatedEvent
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.usecase.storage.AvatarStorage
import com.vibecheck.userservice.usecase.storage.UserProfileStorage
import com.vibecheck.userservice.usecase.storage.UserStorage
import org.springframework.cache.annotation.CachePut
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import user.profile.v1.UserEvents
import java.util.*

@Service
class UserInfoCreation(
    private val userProfileStorage: UserProfileStorage,
    private val userStorage: UserStorage,
    private val avatarStorage: AvatarStorage,
    private val transactionTemplate: TransactionTemplate,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    @CachePut(value = ["users.profiles"], key = "#userId")
    fun create(userId: UUID, createOrUpdateUserInfo: CreateOrUpdateUserInfo): UserInfo = with(createOrUpdateUserInfo) {
        if (!avatarStorage.existsById(avatarId)) {
            throw NotFoundException("Avatar id '${avatarId}' is not found");
        }
        val user = userStorage.findById(userId)

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


        val result = transactionTemplate.execute {
            userProfileStorage.create(profile)
        }

        applicationEventPublisher.publishEvent(UserInfoCreatedEvent(userId, result))

        UserInfo(user, result)
    }
}