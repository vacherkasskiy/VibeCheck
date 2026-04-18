package com.vibecheck.userservice.adapters.kafka

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.kafka.core.ProducerFactory

@Configuration
class KafkaProducerConfig {

    @Bean
    fun protobufKafkaTemplate(
        producerFactory: ProducerFactory<String, ByteArray>
    ): KafkaTemplate<String, ByteArray> {
        return KafkaTemplate(producerFactory)
    }
}