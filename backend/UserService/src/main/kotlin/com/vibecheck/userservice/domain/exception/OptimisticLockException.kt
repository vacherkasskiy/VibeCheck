package com.vibecheck.userservice.domain.exception

class OptimisticLockException(
    override val message: String,
) : RuntimeException(message)
