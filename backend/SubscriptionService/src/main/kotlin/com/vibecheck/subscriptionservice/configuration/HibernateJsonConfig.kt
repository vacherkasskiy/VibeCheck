package com.vibecheck.subscriptionservice.configuration

import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import tools.jackson.databind.ObjectMapper

@Configuration
class HibernateJsonConfig {

    @Bean
    fun hibernateJsonFormatMapper(
        objectMapper: ObjectMapper,
    ): HibernateJsonFormatMapper = HibernateJsonFormatMapper(objectMapper)

    @Bean
    fun hibernatePropertiesCustomizer(
        hibernateJsonFormatMapper: HibernateJsonFormatMapper,
    ): HibernatePropertiesCustomizer = HibernatePropertiesCustomizer { properties ->
        properties["hibernate.type.json_format_mapper"] = hibernateJsonFormatMapper
    }
}
