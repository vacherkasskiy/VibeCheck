package com.vibecheck.subscriptionservice.configuration

import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.clients.CommonClientConfigs
import org.apache.kafka.common.config.SaslConfigs
import org.apache.kafka.common.serialization.ByteArrayDeserializer
import org.apache.kafka.common.serialization.StringDeserializer
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.kafka.annotation.EnableKafka
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory
import org.springframework.kafka.core.ConsumerFactory
import org.springframework.kafka.core.DefaultKafkaConsumerFactory
import org.springframework.kafka.listener.ContainerProperties

@EnableKafka
@Configuration
class KafkaConsumerConfig(
    @Value("\${spring.kafka.bootstrap-servers}")
    private val bootstrapServers: String,
    @Value("\${spring.kafka.consumer.group-id}")
    private val groupId: String,
    @Value("\${spring.kafka.properties.security.protocol:SASL_PLAINTEXT}")
    private val securityProtocol: String,
    @Value("\${spring.kafka.properties.sasl.mechanism:PLAIN}")
    private val saslMechanism: String,
    @Value("\${spring.kafka.properties.sasl.jaas.config:}")
    private val saslJaasConfig: String,
) {
    @Bean
    fun kafkaByteArrayConsumerFactory(): ConsumerFactory<String, ByteArray> {
        val properties: MutableMap<String, Any> = mutableMapOf(
            ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG to bootstrapServers,
            ConsumerConfig.GROUP_ID_CONFIG to groupId,
            ConsumerConfig.AUTO_OFFSET_RESET_CONFIG to "earliest",
            ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG to false,
            CommonClientConfigs.SECURITY_PROTOCOL_CONFIG to securityProtocol,
            SaslConfigs.SASL_MECHANISM to saslMechanism,
        )

        if (saslJaasConfig.isNotBlank()) {
            properties[SaslConfigs.SASL_JAAS_CONFIG] = saslJaasConfig
        }

        properties[ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG] = StringDeserializer::class.java
        properties[ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG] = ByteArrayDeserializer::class.java
        return DefaultKafkaConsumerFactory(properties)
    }

    @Bean
    fun kafkaByteArrayListenerContainerFactory(
        kafkaByteArrayConsumerFactory: ConsumerFactory<String, ByteArray>,
    ): ConcurrentKafkaListenerContainerFactory<String, ByteArray> {
        return ConcurrentKafkaListenerContainerFactory<String, ByteArray>().apply {
            setConsumerFactory(kafkaByteArrayConsumerFactory)
            containerProperties.ackMode = ContainerProperties.AckMode.MANUAL_IMMEDIATE
        }
    }
}
