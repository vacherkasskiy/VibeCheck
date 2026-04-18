package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.domain.events.UserInfoCreatedEvent
import com.vibecheck.userservice.domain.events.UserInfoUpdatedEvent
import com.vibecheck.userservice.domain.exception.NotFoundException
import com.vibecheck.userservice.usecase.storage.AvatarStorage
import com.vibecheck.userservice.usecase.storage.UserProfileStorage
import com.vibecheck.userservice.usecase.storage.UserStorage
import org.springframework.cache.annotation.CachePut
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.util.*

@Service
class UserInfoUpdating(
    private val userStorage: UserStorage,
    private val userProfileStorage: UserProfileStorage,
    private val avatarStorage: AvatarStorage,
    private val transactionTemplate: TransactionTemplate,
    private val eventPublisher: ApplicationEventPublisher,
) {
    @CachePut(value = ["users.profiles"], key = "#userId")
    fun update(userId: UUID, createOrUpdateUserInfo: CreateOrUpdateUserInfo): UserInfo = with(createOrUpdateUserInfo) {
        if (!avatarStorage.existsById(avatarId)) {
            throw NotFoundException("Avatar id '${avatarId}' is not found");
        }
        val oldProfile = userProfileStorage.findById(userId)

        val updatedProfile = oldProfile.update(
            name = name,
            avatarId = avatarId,
            sex = sex,
            birthday = birthday,
            education = education,
            speciality = speciality,
            workExperience = workExperience
        )


        val user = userStorage.findById(userId)

        transactionTemplate.execute {
            val actualProfile = if (oldProfile == updatedProfile) oldProfile else {
                userProfileStorage.update(updatedProfile)
            }

            UserInfo(
                user,
                actualProfile,
            )
        }.also {
            eventPublisher.publishEvent(UserInfoUpdatedEvent(userId, it.profile))
        }
    }
}