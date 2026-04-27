package com.vibecheck.userservice.startup

import com.vibecheck.userservice.adapters.postgres.entity.UserEntity
import com.vibecheck.userservice.adapters.postgres.entity.UserProfileEntity
import com.vibecheck.userservice.adapters.postgres.entity.WorkExperienceDto
import com.vibecheck.userservice.adapters.postgres.repository.UserProfileRepository
import com.vibecheck.userservice.adapters.postgres.repository.UserRepository
import com.vibecheck.userservice.domain.Education
import com.vibecheck.userservice.domain.Sex
import com.vibecheck.userservice.domain.Speciality
import com.vibecheck.userservice.domain.UserRole
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.core.annotation.Order
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import org.springframework.transaction.support.TransactionTemplate
import java.time.Instant
import java.util.*

@Component
@ConditionalOnProperty(
    prefix = "user-service.test-users-seed",
    name = ["enabled"],
    havingValue = "true",
)
@Order(20)
class TestUsersStartupSeeder(
    private val userRepository: UserRepository,
    private val userProfileRepository: UserProfileRepository,
    private val passwordEncoder: PasswordEncoder,
    private val testUsersSeedProperties: TestUsersSeedProperties,
    private val transactionTemplate: TransactionTemplate
) : ApplicationRunner {

    override fun run(args: ApplicationArguments) {
        if (userRepository.count() > 0) {
            logger.info("Skipping test users seed because table 'users' is not empty")
            return
        }

        transactionTemplate.execute {
            seedUsers()
        }
    }

    fun seedUsers() {
        val encodedPassword = requireNotNull(passwordEncoder.encode(testUsersSeedProperties.defaultPassword))
        val users = SEED_USERS.map { it.toUserEntity(encodedPassword) }
        val profiles = SEED_USERS.map { it.toUserProfileEntity() }

        userRepository.saveAll(users)
        userProfileRepository.saveAll(profiles)

        logger.info("Inserted {} test users and profiles", users.size)
    }

    private data class SeedUser(
        val id: UUID,
        val email: String,
        val roles: List<UserRole>,
        val name: String,
        val sex: Sex,
        val birthday: Instant,
        val avatarId: String,
        val education: Education,
        val speciality: Speciality,
        val workExperience: List<WorkExperienceDto>,
    ) {
        fun toUserEntity(encodedPassword: String): UserEntity = UserEntity().apply {
            id = this@SeedUser.id
            email = this@SeedUser.email
            password = encodedPassword
            roles = this@SeedUser.roles
            isBanned = false
        }

        fun toUserProfileEntity(): UserProfileEntity = UserProfileEntity().apply {
            userId = id
            name = this@SeedUser.name
            sex = this@SeedUser.sex
            birthday = this@SeedUser.birthday
            avatarId = this@SeedUser.avatarId
            education = this@SeedUser.education
            speciality = this@SeedUser.speciality
            workExperience = this@SeedUser.workExperience
        }
    }

    private companion object {
        private val logger = LoggerFactory.getLogger(TestUsersStartupSeeder::class.java)

        private val SEED_USERS = listOf(
            SeedUser(
                id = UUID.fromString("4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101"),
                email = "alex.admin@vibecheck.local",
                roles = listOf(UserRole.ADMIN, UserRole.USER),
                name = "Alex Admin",
                sex = Sex.SEX_OTHER,
                birthday = Instant.parse("1993-05-17T00:00:00Z"),
                avatarId = "viktor-avatar.png",
                education = Education.EDUCATION_LEVEL_MASTER,
                speciality = Speciality.SPECIALTY_PROJECT_MANAGEMENT,
                workExperience = listOf(
                    WorkExperienceDto(
                        specialization = Speciality.SPECIALTY_PROJECT_MANAGEMENT,
                        startedAt = Instant.parse("2018-02-01T00:00:00Z"),
                        finishedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("8b9d91ee-8673-4e3d-a39c-3bfa3a9b8f11"),
                email = "nina.qa@vibecheck.local",
                roles = listOf(UserRole.USER),
                name = "Nina QA",
                sex = Sex.SEX_FEMALE,
                birthday = Instant.parse("1997-09-08T00:00:00Z"),
                avatarId = "cat-avatar.png",
                education = Education.EDUCATION_LEVEL_BACHELOR,
                speciality = Speciality.SPECIALTY_IT,
                workExperience = listOf(
                    WorkExperienceDto(
                        specialization = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2020-06-01T00:00:00Z"),
                        finishedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("34d50c6a-b6bf-4ba8-8798-5dc80df2f3d4"),
                email = "maks.dev@vibecheck.local",
                roles = listOf(UserRole.USER),
                name = "Maks Dev",
                sex = Sex.SEX_MALE,
                birthday = Instant.parse("1995-01-21T00:00:00Z"),
                avatarId = "fox-avatar.png",
                education = Education.EDUCATION_LEVEL_SPECIALIST,
                speciality = Speciality.SPECIALTY_IT,
                workExperience = listOf(
                    WorkExperienceDto(
                        specialization = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2019-03-15T00:00:00Z"),
                        finishedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("5d6aeb12-b7b5-484f-9e0e-f53fbb53b973"),
                email = "olga.design@vibecheck.local",
                roles = listOf(UserRole.USER),
                name = "Olga Design",
                sex = Sex.SEX_FEMALE,
                birthday = Instant.parse("1998-11-30T00:00:00Z"),
                avatarId = "rabbit-avatar.png",
                education = Education.EDUCATION_LEVEL_BACHELOR,
                speciality = Speciality.SPECIALTY_DESIGN,
                workExperience = listOf(
                    WorkExperienceDto(
                        specialization = Speciality.SPECIALTY_DESIGN,
                        startedAt = Instant.parse("2021-04-01T00:00:00Z"),
                        finishedAt = null,
                    ),
                ),
            ),
        )
    }
}
