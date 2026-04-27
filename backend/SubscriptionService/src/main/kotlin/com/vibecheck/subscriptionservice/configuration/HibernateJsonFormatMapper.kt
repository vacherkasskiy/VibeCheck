package com.vibecheck.subscriptionservice.configuration

import org.hibernate.type.descriptor.WrapperOptions
import org.hibernate.type.descriptor.java.JavaType
import org.hibernate.type.format.FormatMapper
import tools.jackson.databind.ObjectMapper

class HibernateJsonFormatMapper(
    private val objectMapper: ObjectMapper,
) : FormatMapper {

    override fun <T> fromString(
        charSequence: CharSequence,
        javaType: JavaType<T>,
        wrapperOptions: WrapperOptions,
    ): T {
        val jacksonType = objectMapper.typeFactory.constructType(javaType.javaType)
        return objectMapper.readValue(charSequence.toString(), jacksonType)
    }

    override fun <T> toString(
        value: T,
        javaType: JavaType<T>,
        wrapperOptions: WrapperOptions,
    ): String = objectMapper.writeValueAsString(value)
}
