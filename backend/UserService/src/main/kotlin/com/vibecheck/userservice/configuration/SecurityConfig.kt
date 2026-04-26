package com.vibecheck.userservice.configuration

import com.vibecheck.userservice.security.CustomUserDetailsService
import com.vibecheck.userservice.security.jwt.JwtAuthenticationConverter
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.crypto.factory.PasswordEncoderFactories
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.web.SecurityFilterChain

@Configuration
class SecurityConfig {
    @Bean
    fun passwordEncoder(): PasswordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder()

    @Bean
    fun authenticationManager(authenticationConfiguration: AuthenticationConfiguration): AuthenticationManager {
        return authenticationConfiguration.authenticationManager
    }

    @Bean
    fun authenticationProvider(customUserDetailsService: CustomUserDetailsService): DaoAuthenticationProvider {
        val provider = DaoAuthenticationProvider(customUserDetailsService)
        provider.setPasswordEncoder(passwordEncoder())
        return provider
    }

    @Bean
    fun securityFilterChain(
        http: HttpSecurity,
        jwtAuthenticationConverter: JwtAuthenticationConverter,
        @Qualifier("accessJwtDecoder")
        accessJwtDecoder: JwtDecoder,
    ): SecurityFilterChain {
        http {
            csrf { disable() }
            httpBasic { disable() }
            formLogin { disable() }
            authorizeHttpRequests {
                authorize("/auth/email/**", permitAll)
                authorize("/auth/internal/login", permitAll)
                authorize("/v3/api-docs/**", permitAll)
                authorize("/swagger-ui/**", permitAll)
                authorize("/swagger-ui.html", permitAll)
                authorize("/actuator/health/**", permitAll)
                authorize("/internal/**", hasAnyAuthority("ADMIN", "MODERATOR", "MANAGER"))
                authorize("/api/public/**", permitAll)
                authorize(anyRequest, authenticated)
            }
            sessionManagement {
                sessionCreationPolicy = org.springframework.security.config.http.SessionCreationPolicy.STATELESS
            }
            oauth2ResourceServer {
                jwt {
                    this.jwtDecoder = accessJwtDecoder
                    this.jwtAuthenticationConverter = jwtAuthenticationConverter
                }
            }
        }

        return http.build()
    }
}
