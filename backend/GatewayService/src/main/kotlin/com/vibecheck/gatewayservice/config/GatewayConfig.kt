package com.vibecheck.gatewayservice.config

import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@EnableConfigurationProperties(
    GatewayProperties::class,
    ProxyHttpClientProperties::class,
    GatewayTlsProperties::class
)
class GatewayConfig
