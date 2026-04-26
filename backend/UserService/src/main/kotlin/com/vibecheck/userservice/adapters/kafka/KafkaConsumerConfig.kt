package com.vibecheck.userservice.adapters.kafka

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.kafka.annotation.EnableKafka
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory
import org.springframework.kafka.core.ConsumerFactory
import org.springframework.kafka.listener.ContainerProperties

@EnableKafka
@Configuration
class KafkaConsumerConfig {
    @Bean
    fun reportsKafkaListenerContainerFactory(
        consumerFactory: ConsumerFactory<String, ByteArray>,
    ): ConcurrentKafkaListenerContainerFactory<String, ByteArray> {
        return ConcurrentKafkaListenerContainerFactory<String, ByteArray>().apply {
            setConsumerFactory(consumerFactory)
            containerProperties.ackMode = ContainerProperties.AckMode.MANUAL_IMMEDIATE
        }
    }
}
