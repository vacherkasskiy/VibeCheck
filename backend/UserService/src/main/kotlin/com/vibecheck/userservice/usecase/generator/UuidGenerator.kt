package com.vibecheck.userservice.usecase.generator

import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UuidGenerator {
    fun generate(): UUID = UUID.randomUUID()
}