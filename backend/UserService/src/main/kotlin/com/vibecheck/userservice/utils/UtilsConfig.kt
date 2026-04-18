package com.vibecheck.userservice.utils

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Clock

@Configuration
class UtilsConfig {
    @Bean
    fun clock(): Clock = Clock.systemDefaultZone()
}