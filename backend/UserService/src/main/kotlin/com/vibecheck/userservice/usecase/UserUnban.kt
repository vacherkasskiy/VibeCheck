package com.vibecheck.userservice.usecase

import com.vibecheck.userservice.usecase.cache.AccessTokenBlacklistCache
import com.vibecheck.userservice.usecase.storage.UserStorage
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.util.UUID

@Service
class UserUnban(
    private val accessTokenBlacklistCache: AccessTokenBlacklistCache,
    private val userStorage: UserStorage,
    private val transactionTemplate: TransactionTemplate,
) {
    fun unban(userId: UUID) {
        val user = userStorage.findById(userId)
        if (!user.isBanned) {
            return
        }

        transactionTemplate.execute {
            userStorage.update(user.unban())
        }

        accessTokenBlacklistCache.remove(userId)
    }
}
