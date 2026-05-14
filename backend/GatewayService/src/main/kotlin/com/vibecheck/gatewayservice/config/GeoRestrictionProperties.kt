package com.vibecheck.gatewayservice.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "gateway.geo-restriction")
data class GeoRestrictionProperties(
    val enabled: Boolean = false,
    val allowedCountryCodes: Set<String> = setOf("RU"),
    val countryHeader: String = "X-Geo-Country-Code",
    val failOnMissingHeader: Boolean = true,
    val allowPrivateIpBypass: Boolean = true
)
