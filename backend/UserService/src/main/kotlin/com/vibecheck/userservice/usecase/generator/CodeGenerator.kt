package com.vibecheck.userservice.usecase.generator

import org.springframework.stereotype.Service
import kotlin.random.Random

@Service
class CodeGenerator {
    fun generate(): Int = Random.nextInt(FROM_INCLUSIVE, UNTIL_EXCLUSIVE)

    private companion object {
        private const val FROM_INCLUSIVE = 100_000
        private const val UNTIL_EXCLUSIVE = 1_000_000
    }
}
