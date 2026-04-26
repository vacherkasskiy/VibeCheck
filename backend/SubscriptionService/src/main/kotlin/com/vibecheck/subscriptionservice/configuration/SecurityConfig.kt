package com.vibecheck.subscriptionservice.configuration

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.web.SecurityFilterChain

@Configuration
class SecurityConfig {
    @Bean
    fun securityFilterChain(
        http: HttpSecurity,
        internalJwtDecoder: JwtDecoder,
    ): SecurityFilterChain {
        http {
            csrf { disable() }
            httpBasic { disable() }
            formLogin { disable() }
            authorizeHttpRequests {
                authorize("/api/public/**", permitAll)
                authorize("/v3/api-docs/**", permitAll)
                authorize("/swagger-ui/**", permitAll)
                authorize("/swagger-ui.html", permitAll)
                authorize(anyRequest, authenticated)
            }
            sessionManagement {
                sessionCreationPolicy = org.springframework.security.config.http.SessionCreationPolicy.STATELESS
            }
            oauth2ResourceServer {
                jwt {
                    jwtDecoder = internalJwtDecoder
                }
            }
        }

        return http.build()
    }
}
