package com.vibecheck.gatewayservice.config

import io.netty.channel.ChannelOption
import io.netty.handler.timeout.ReadTimeoutHandler
import io.netty.handler.timeout.WriteTimeoutHandler
import org.springframework.cloud.gateway.config.HttpClientCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import reactor.netty.http.client.HttpClient
import java.util.concurrent.TimeUnit

@Configuration
class ProxyHttpClientConfig {

    @Bean
    fun proxyHttpClientCustomizer(
        proxyHttpClientProperties: ProxyHttpClientProperties
    ): HttpClientCustomizer {
        return HttpClientCustomizer { httpClient: HttpClient ->
            httpClient
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, proxyHttpClientProperties.connectTimeoutMillis)
                .responseTimeout(proxyHttpClientProperties.responseTimeout)
                .doOnConnected { connection ->
                    connection.addHandlerLast(
                        ReadTimeoutHandler(
                            proxyHttpClientProperties.readTimeout.toMillis(),
                            TimeUnit.MILLISECONDS
                        )
                    )
                    connection.addHandlerLast(
                        WriteTimeoutHandler(
                            proxyHttpClientProperties.writeTimeout.toMillis(),
                            TimeUnit.MILLISECONDS
                        )
                    )
                }
        }
    }
}
