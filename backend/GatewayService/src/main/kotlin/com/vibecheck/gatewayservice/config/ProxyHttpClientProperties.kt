package com.vibecheck.gatewayservice.config

import org.springframework.boot.context.properties.ConfigurationProperties
import java.time.Duration

@ConfigurationProperties(prefix = "gateway.proxy-http-client")
data class ProxyHttpClientProperties(
    val connectTimeoutMillis: Int = 5000,
    val responseTimeout: Duration = Duration.ofSeconds(5),
    val readTimeout: Duration = Duration.ofSeconds(5),
    val writeTimeout: Duration = Duration.ofSeconds(5)
)
