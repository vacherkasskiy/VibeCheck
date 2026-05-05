package com.vibecheck.userservice.configuration

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.cache.Cache
import org.springframework.cache.interceptor.CacheErrorHandler
import org.springframework.cache.interceptor.SimpleCacheErrorHandler
import org.springframework.data.redis.cache.RedisCacheConfiguration
import org.springframework.data.redis.cache.RedisCacheManager
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer
import org.springframework.data.redis.serializer.RedisSerializationContext
import org.slf4j.LoggerFactory
import java.time.Duration

@Configuration
class CacheConfig {

    @Bean
    fun cacheManager(connectionFactory: RedisConnectionFactory): RedisCacheManager {
        val genericSerializer = GenericJacksonJsonRedisSerializer.builder()
            .enableUnsafeDefaultTyping()
            .enableSpringCacheNullValueSupport()
            .customize { it.findAndAddModules() }
            .build()

        val config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(20))
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(genericSerializer)
            )

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .build()
    }

    @Bean
    fun cacheErrorHandler(): CacheErrorHandler = object : SimpleCacheErrorHandler() {
        override fun handleCacheGetError(exception: RuntimeException, cache: Cache, key: Any) {
            logger.warn(
                "Failed to read cache '{}' for key '{}'. Evicting stale entry and falling back to source.",
                cache.name,
                key,
                exception
            )
            cache.evict(key)
        }
    }

    private companion object {
        private val logger = LoggerFactory.getLogger(CacheConfig::class.java)
    }
}
