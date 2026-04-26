package com.vibecheck.gatewayservice.client

import org.springframework.http.HttpHeaders

class UpstreamServiceException(
    val statusCode: Int,
    val headers: HttpHeaders,
    val body: ByteArray
) : RuntimeException("Upstream service responded with status $statusCode")
