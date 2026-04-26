package com.vibecheck.userservice

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import org.springframework.cache.annotation.EnableCaching

@EnableCaching
@ConfigurationPropertiesScan
@SpringBootApplication
class UserServiceApplication

fun main(args: Array<String>) {
    runApplication<UserServiceApplication>(*args)
}
