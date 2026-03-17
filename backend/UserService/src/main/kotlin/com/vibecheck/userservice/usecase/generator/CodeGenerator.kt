package com.vibecheck.userservice.usecase.generator

import org.springframework.stereotype.Service

@Service
class CodeGenerator {
    fun generate(): Int = (System.currentTimeMillis() % 10000).toInt()
}