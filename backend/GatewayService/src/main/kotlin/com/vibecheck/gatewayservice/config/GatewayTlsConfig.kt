package com.vibecheck.gatewayservice.config

import org.springframework.boot.web.server.ConfigurableWebServerFactory
import org.springframework.boot.web.server.Ssl
import org.springframework.boot.web.server.WebServerFactoryCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class GatewayTlsConfig {

    @Bean
    fun tlsWebServerFactoryCustomizer(
        gatewayTlsProperties: GatewayTlsProperties
    ): WebServerFactoryCustomizer<ConfigurableWebServerFactory> {
        return WebServerFactoryCustomizer { factory ->
            if (!gatewayTlsProperties.enabled) {
                return@WebServerFactoryCustomizer
            }

            validate(gatewayTlsProperties)

            val ssl = Ssl().apply {
                isEnabled = true
                protocol = gatewayTlsProperties.protocol
                clientAuth = when (gatewayTlsProperties.clientAuth) {
                    GatewayTlsProperties.ClientAuthMode.NONE -> Ssl.ClientAuth.NONE
                    GatewayTlsProperties.ClientAuthMode.WANT -> Ssl.ClientAuth.WANT
                    GatewayTlsProperties.ClientAuthMode.NEED -> Ssl.ClientAuth.NEED
                }
                keyStore = gatewayTlsProperties.keyStore.path
                keyStorePassword = gatewayTlsProperties.keyStore.password
                keyStoreType = gatewayTlsProperties.keyStore.type
                keyAlias = gatewayTlsProperties.keyStore.keyAlias.takeIf { it.isNotBlank() }
                keyPassword = gatewayTlsProperties.keyStore.keyPassword.takeIf { it.isNotBlank() }
                keyStoreProvider = gatewayTlsProperties.keyStore.provider.takeIf { it.isNotBlank() }
                trustStore = gatewayTlsProperties.trustStore.path.takeIf { it.isNotBlank() }
                trustStorePassword = gatewayTlsProperties.trustStore.password.takeIf { it.isNotBlank() }
                trustStoreType = gatewayTlsProperties.trustStore.type.takeIf { it.isNotBlank() }
                trustStoreProvider = gatewayTlsProperties.trustStore.provider.takeIf { it.isNotBlank() }
            }

            factory.setSsl(ssl)
        }
    }

    private fun validate(gatewayTlsProperties: GatewayTlsProperties) {
        require(gatewayTlsProperties.keyStore.path.isNotBlank()) {
            "gateway.tls.key-store.path must be set when gateway.tls.enabled=true"
        }
        require(gatewayTlsProperties.keyStore.password.isNotBlank()) {
            "gateway.tls.key-store.password must be set when gateway.tls.enabled=true"
        }

        val clientAuthRequired = gatewayTlsProperties.clientAuth != GatewayTlsProperties.ClientAuthMode.NONE
        if (clientAuthRequired) {
            require(gatewayTlsProperties.trustStore.path.isNotBlank()) {
                "gateway.tls.trust-store.path must be set when client auth is enabled"
            }
            require(gatewayTlsProperties.trustStore.password.isNotBlank()) {
                "gateway.tls.trust-store.password must be set when client auth is enabled"
            }
        }
    }
}
