package com.vibecheck.subscriptionservice.adapters.postgres

import org.jooq.Field
import org.jooq.JSONB
import org.jooq.Table
import org.jooq.impl.AbstractConverter
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

object SubscriptionsTable {
    val TABLE: Table<*> = DSL.table(DSL.name("subscriptions"))
    val AUTHOR_ID: Field<UUID> = DSL.field(DSL.name("subscriptions", "author_id"), SQLDataType.UUID.nullable(false))
    val SUBSCRIBER_ID: Field<UUID> = DSL.field(DSL.name("subscriptions", "subscriber_id"), SQLDataType.UUID.nullable(false))
    val CREATED_AT: Field<Instant> = timestamptzField("subscriptions", "created_at")
}

object UserActivityTable {
    val TABLE: Table<*> = DSL.table(DSL.name("user_activity"))
    val ID: Field<UUID> = DSL.field(DSL.name("user_activity", "id"), SQLDataType.UUID.nullable(false))
    val USER_ID: Field<UUID> = DSL.field(DSL.name("user_activity", "user_id"), SQLDataType.UUID)
    val ACTIVITY_INFO: Field<JSONB> = DSL.field(DSL.name("user_activity", "activity_info"), SQLDataType.JSONB.nullable(false))
    val CREATED_AT: Field<Instant> = nullableTimestamptzField("user_activity", "created_at")
    val EXPIRED_AT: Field<Instant> = nullableTimestamptzField("user_activity", "expired_at")
}

object UserProfileTable {
    val TABLE: Table<*> = DSL.table(DSL.name("user_profile"))
    val USER_ID: Field<UUID> = DSL.field(DSL.name("user_profile", "user_id"), SQLDataType.UUID.nullable(false))
    val VERSION: Field<Int> = DSL.field(DSL.name("user_profile", "version"), SQLDataType.INTEGER)
    val NAME: Field<String> = DSL.field(DSL.name("user_profile", "name"), SQLDataType.CLOB)
    val AVATAR_ID: Field<String> = DSL.field(DSL.name("user_profile", "avatar_id"), SQLDataType.CLOB)
    val SEX: Field<String> = DSL.field(DSL.name("user_profile", "sex"), SQLDataType.CLOB)
    val BIRTHDAY: Field<Instant> = nullableTimestamptzField("user_profile", "birthday")
}

private val OFFSET_DATE_TIME_TO_INSTANT = object : AbstractConverter<OffsetDateTime, Instant>(OffsetDateTime::class.java, Instant::class.java) {
    override fun from(databaseObject: OffsetDateTime?): Instant? = databaseObject?.toInstant()

    override fun to(userObject: Instant?): OffsetDateTime? = userObject?.atOffset(ZoneOffset.UTC)
}

private fun timestamptzField(table: String, column: String): Field<Instant> =
    DSL.field(
        DSL.name(table, column),
        SQLDataType.TIMESTAMPWITHTIMEZONE.asConvertedDataType(OFFSET_DATE_TIME_TO_INSTANT).nullable(false),
    )

private fun nullableTimestamptzField(table: String, column: String): Field<Instant> =
    DSL.field(
        DSL.name(table, column),
        SQLDataType.TIMESTAMPWITHTIMEZONE.asConvertedDataType(OFFSET_DATE_TIME_TO_INSTANT),
    )
