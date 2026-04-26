package com.vibecheck.gatewayservice.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "gateway.tls")
data class GatewayTlsProperties(
    val enabled: Boolean = false,
    val clientAuth: ClientAuthMode = ClientAuthMode.NONE,
    val protocol: String = "TLS",
    val keyStore: Store = Store(),
    val trustStore: Store = Store()
) {
    data class Store(
        val path: String = "",
        val password: String = "",
        val type: String = "PKCS12",
        val provider: String = "",
        val keyAlias: String = "",
        val keyPassword: String = ""
    )

    enum class ClientAuthMode {
        NONE,
        WANT,
        NEED
    }
}
