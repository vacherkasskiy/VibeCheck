package com.vibecheck.userservice.adapters.postgres

import org.jooq.Field
import org.jooq.JSONB
import org.jooq.Table
import org.jooq.impl.AbstractConverter
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import java.sql.Timestamp
import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

object AvatarsTable {
    val TABLE: Table<*> = DSL.table(DSL.name("avatars"))
    val ID: Field<String> = DSL.field(DSL.name("avatars", "id"), SQLDataType.VARCHAR(255).nullable(false))
    val VERSION: Field<Int> = DSL.field(DSL.name("avatars", "version"), SQLDataType.INTEGER.nullable(false))
    val URL: Field<String> = DSL.field(DSL.name("avatars", "url"), SQLDataType.VARCHAR(1024).nullable(false))
    val CREATED_AT: Field<Instant> = timestamptzField("avatars", "created_at")
    val UPDATED_AT: Field<Instant> = timestamptzField("avatars", "updated_at")
}

object UsersTable {
    val TABLE: Table<*> = DSL.table(DSL.name("users"))
    val ID: Field<UUID> = DSL.field(DSL.name("users", "id"), SQLDataType.UUID.nullable(false))
    val VERSION: Field<Int> = DSL.field(DSL.name("users", "version"), SQLDataType.INTEGER.nullable(false))
    val EMAIL: Field<String> = DSL.field(DSL.name("users", "email"), SQLDataType.VARCHAR(255).nullable(false))
    val PASSWORD: Field<String> = DSL.field(DSL.name("users", "password"), SQLDataType.VARCHAR(255).nullable(false))
    val ROLES: Field<JSONB> = DSL.field(DSL.name("users", "roles"), SQLDataType.JSONB.nullable(false))
    val IS_BANNED: Field<Boolean> = DSL.field(DSL.name("users", "is_banned"), SQLDataType.BOOLEAN.nullable(false))
    val CREATED_AT: Field<Instant> = timestamptzField("users", "created_at")
    val UPDATED_AT: Field<Instant> = timestamptzField("users", "updated_at")
}

object UserProfileTable {
    val TABLE: Table<*> = DSL.table(DSL.name("user_profile"))
    val USER_ID: Field<UUID> = DSL.field(DSL.name("user_profile", "user_id"), SQLDataType.UUID.nullable(false))
    val VERSION: Field<Int> = DSL.field(DSL.name("user_profile", "version"), SQLDataType.INTEGER.nullable(false))
    val NAME: Field<String> = DSL.field(DSL.name("user_profile", "name"), SQLDataType.VARCHAR(255).nullable(false))
    val SEX: Field<String> = DSL.field(DSL.name("user_profile", "sex"), SQLDataType.VARCHAR(50).nullable(false))
    val AVATAR_ID: Field<String> = DSL.field(DSL.name("user_profile", "avatar_id"), SQLDataType.VARCHAR(255).nullable(false))
    val BIRTHDAY: Field<Instant> = timestamptzField("user_profile", "birthday")
    val EDUCATION: Field<String> = DSL.field(DSL.name("user_profile", "education"), SQLDataType.VARCHAR(100).nullable(false))
    val SPECIALITY: Field<String> = DSL.field(DSL.name("user_profile", "speciality"), SQLDataType.VARCHAR(100).nullable(false))
    val WORK_EXPERIENCE: Field<JSONB> = DSL.field(DSL.name("user_profile", "work_experience"), SQLDataType.JSONB.nullable(false))
    val CREATED_AT: Field<Instant> = timestamptzField("user_profile", "created_at")
    val UPDATED_AT: Field<Instant> = timestamptzField("user_profile", "updated_at")
}

object OnboardingStepTable {
    val TABLE: Table<*> = DSL.table(DSL.name("onboarding_step"))
    val ID: Field<String> = DSL.field(DSL.name("onboarding_step", "id"), SQLDataType.VARCHAR(255).nullable(false))
    val NEXT_STEP_ID: Field<String> = DSL.field(DSL.name("onboarding_step", "next_step_id"), SQLDataType.VARCHAR(255))
    val IS_PRIMARY: Field<Boolean> = DSL.field(DSL.name("onboarding_step", "is_primary"), SQLDataType.BOOLEAN.nullable(false))
}

object UserOnboardingStepTable {
    val TABLE: Table<*> = DSL.table(DSL.name("user_onboarding_step"))
    val ID: Field<Long> = DSL.field(DSL.name("user_onboarding_step", "id"), SQLDataType.BIGINT.nullable(false))
    val VERSION: Field<Int> = DSL.field(DSL.name("user_onboarding_step", "version"), SQLDataType.INTEGER.nullable(false))
    val USER_ID: Field<UUID> = DSL.field(DSL.name("user_onboarding_step", "user_id"), SQLDataType.UUID.nullable(false))
    val STEP_ID: Field<String> = DSL.field(DSL.name("user_onboarding_step", "step_id"), SQLDataType.VARCHAR(255).nullable(false))
    val STATUS: Field<String> = DSL.field(DSL.name("user_onboarding_step", "status"), SQLDataType.VARCHAR(50).nullable(false))
    val CREATED_AT: Field<Instant> = timestamptzField("user_onboarding_step", "created_at")
    val UPDATED_AT: Field<Instant> = timestamptzField("user_onboarding_step", "updated_at")
}

object UserConfirmationTable {
    val TABLE: Table<*> = DSL.table(DSL.name("user_confirmation"))
    val CONFIRM_CODE: Field<Int> = DSL.field(DSL.name("user_confirmation", "confirm_code"), SQLDataType.INTEGER.nullable(false))
    val EMAIL: Field<String> = DSL.field(DSL.name("user_confirmation", "email"), SQLDataType.VARCHAR(100).nullable(false))
    val PASSWORD: Field<String> = DSL.field(DSL.name("user_confirmation", "password"), SQLDataType.VARCHAR(255).nullable(false))
    val EXPIRED_AT: Field<Instant> = timestamptzField("user_confirmation", "expired_at")
    val CREATED_AT: Field<Instant> = timestamptzField("user_confirmation", "created_at")
    val UPDATED_AT: Field<Instant> = timestamptzField("user_confirmation", "updated_at")
}

object RefreshTokenTable {
    val TABLE: Table<*> = DSL.table(DSL.name("refresh_tokens"))
    val TOKEN_ID: Field<String> = DSL.field(DSL.name("refresh_tokens", "token_id"), SQLDataType.VARCHAR(64).nullable(false))
    val VERSION: Field<Int> = DSL.field(DSL.name("refresh_tokens", "version"), SQLDataType.INTEGER.nullable(false))
    val USER_ID: Field<UUID> = DSL.field(DSL.name("refresh_tokens", "user_id"), SQLDataType.UUID.nullable(false))
    val TOKEN_HASH: Field<String> = DSL.field(DSL.name("refresh_tokens", "token_hash"), SQLDataType.VARCHAR(2048).nullable(false))
    val ISSUED_AT: Field<Instant> = timestampField("refresh_tokens", "issued_at")
    val EXPIRES_AT: Field<Instant> = timestampField("refresh_tokens", "expires_at")
    val REVOKED_AT: Field<Instant> = timestampField("refresh_tokens", "revoked_at")
    val CREATED_AT: Field<Instant> = timestampField("refresh_tokens", "created_at")
}

object UserReportTable {
    val TABLE: Table<*> = DSL.table(DSL.name("user_reports"))
    val REPORT_ID: Field<String> = DSL.field(DSL.name("user_reports", "report_id"), SQLDataType.VARCHAR(255).nullable(false))
    val VERSION: Field<Int> = DSL.field(DSL.name("user_reports", "version"), SQLDataType.INTEGER.nullable(false))
    val SOURCE: Field<String> = DSL.field(DSL.name("user_reports", "source"), SQLDataType.VARCHAR(32).nullable(false))
    val TARGET_USER_ID: Field<UUID> = DSL.field(DSL.name("user_reports", "target_user_id"), SQLDataType.UUID.nullable(false))
    val REPORTER_USER_ID: Field<UUID> = DSL.field(DSL.name("user_reports", "reporter_user_id"), SQLDataType.UUID.nullable(false))
    val REVIEW_ID: Field<String> = DSL.field(DSL.name("user_reports", "review_id"), SQLDataType.VARCHAR(255))
    val REASON_TYPE: Field<String> = DSL.field(DSL.name("user_reports", "reason_type"), SQLDataType.VARCHAR(64).nullable(false))
    val REASON_TEXT: Field<String> = DSL.field(DSL.name("user_reports", "reason_text"), SQLDataType.VARCHAR(1000))
    val STATUS: Field<String> = DSL.field(DSL.name("user_reports", "status"), SQLDataType.VARCHAR(32).nullable(false))
    val CREATED_AT: Field<Instant> = timestamptzField("user_reports", "created_at")
    val EXTERNAL_EVENT_ID: Field<String> = DSL.field(DSL.name("user_reports", "external_event_id"), SQLDataType.VARCHAR(255))
}

object ProcessedReportEventTable {
    val TABLE: Table<*> = DSL.table(DSL.name("processed_report_events"))
    val EVENT_ID: Field<String> = DSL.field(DSL.name("processed_report_events", "event_id"), SQLDataType.VARCHAR(255).nullable(false))
    val REPORT_ID: Field<String> = DSL.field(DSL.name("processed_report_events", "report_id"), SQLDataType.VARCHAR(255).nullable(false))
    val PROCESSED_AT: Field<Instant> = timestamptzField("processed_report_events", "processed_at")
}

object UserLoginDeviceTable {
    val TABLE: Table<*> = DSL.table(DSL.name("user_login_devices"))
    val USER_ID: Field<UUID> = DSL.field(DSL.name("user_login_devices", "user_id"), SQLDataType.UUID.nullable(false))
    val FINGERPRINT: Field<String> = DSL.field(DSL.name("user_login_devices", "fingerprint"), SQLDataType.VARCHAR(64).nullable(false))
    val USER_AGENT: Field<String> = DSL.field(DSL.name("user_login_devices", "user_agent"), SQLDataType.VARCHAR(1024).nullable(false))
    val IP_ADDRESS: Field<String> = DSL.field(DSL.name("user_login_devices", "ip_address"), SQLDataType.VARCHAR(255))
    val CREATED_AT: Field<Instant> = timestamptzField("user_login_devices", "created_at")
}

private val OFFSET_DATE_TIME_TO_INSTANT = object : AbstractConverter<OffsetDateTime, Instant>(OffsetDateTime::class.java, Instant::class.java) {
    override fun from(databaseObject: OffsetDateTime?): Instant? = databaseObject?.toInstant()

    override fun to(userObject: Instant?): OffsetDateTime? = userObject?.atOffset(ZoneOffset.UTC)
}

private val TIMESTAMP_TO_INSTANT = object : AbstractConverter<Timestamp, Instant>(Timestamp::class.java, Instant::class.java) {
    override fun from(databaseObject: Timestamp?): Instant? = databaseObject?.toInstant()

    override fun to(userObject: Instant?): Timestamp? = userObject?.let(Timestamp::from)
}

private fun timestamptzField(table: String, column: String): Field<Instant> =
    DSL.field(
        DSL.name(table, column),
        SQLDataType.TIMESTAMPWITHTIMEZONE.asConvertedDataType(OFFSET_DATE_TIME_TO_INSTANT).nullable(false),
    )

private fun timestampField(table: String, column: String): Field<Instant> =
    DSL.field(
        DSL.name(table, column),
        SQLDataType.TIMESTAMP.asConvertedDataType(TIMESTAMP_TO_INSTANT),
    )
