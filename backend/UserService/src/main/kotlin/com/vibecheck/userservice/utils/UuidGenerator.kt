package com.vibecheck.userservice.utils

import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UuidGenerator {
    fun generate(): UUID = UUID.randomUUID()
}