package com.vibecheck.userservice.startup

import com.vibecheck.userservice.domain.Education
import com.vibecheck.userservice.domain.OnboardingStep
import com.vibecheck.userservice.domain.Sex
import com.vibecheck.userservice.domain.Speciality
import com.vibecheck.userservice.domain.User
import com.vibecheck.userservice.domain.UserOnboardingStep
import com.vibecheck.userservice.domain.UserRole
import com.vibecheck.userservice.domain.UserProfile
import com.vibecheck.userservice.domain.WorkExperience
import com.vibecheck.userservice.usecase.storage.OnboardingStepStorage
import com.vibecheck.userservice.usecase.storage.UserOnboardingStepStorage
import com.vibecheck.userservice.usecase.storage.UserProfileStorage
import com.vibecheck.userservice.usecase.storage.UserStorage
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.core.annotation.Order
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import org.springframework.transaction.support.TransactionTemplate
import java.time.Instant
import java.util.UUID

@Component
@ConditionalOnProperty(
    prefix = "user-service.test-users-seed",
    name = ["enabled"],
    havingValue = "true",
)
@Order(20)
class TestUsersStartupSeeder(
    private val userStorage: UserStorage,
    private val userProfileStorage: UserProfileStorage,
    private val onboardingStepStorage: OnboardingStepStorage,
    private val userOnboardingStepStorage: UserOnboardingStepStorage,
    private val passwordEncoder: PasswordEncoder,
    private val testUsersSeedProperties: TestUsersSeedProperties,
    private val transactionTemplate: TransactionTemplate,
) : ApplicationRunner {

    override fun run(args: ApplicationArguments) {
        transactionTemplate.execute {
            seedUsersAndEnsureOnboardingSteps()
        }
    }

    fun seedUsersAndEnsureOnboardingSteps() {
        val encodedPassword = requireNotNull(passwordEncoder.encode(testUsersSeedProperties.defaultPassword))
        val primaryOnboardingStepId = ensurePrimaryOnboardingStep().id

        val missingSeedUsers = SEED_USERS.filterNot { userStorage.existsById(it.id) }

        missingSeedUsers.forEach { seedUser ->
            userStorage.create(seedUser.toUser(encodedPassword))
            userProfileStorage.create(seedUser.toUserProfile())
            userOnboardingStepStorage.create(UserOnboardingStep.new(seedUser.id, primaryOnboardingStepId))
        }

        if (missingSeedUsers.isNotEmpty()) {
            logger.info("Inserted {} missing test users, profiles and onboarding steps", missingSeedUsers.size)
        }

        val missingOnboardingStepUserIds = SEED_USERS
            .map { it.id }
            .filterNot(userOnboardingStepStorage::existsByUserId)

        if (missingOnboardingStepUserIds.isEmpty()) {
            logger.info("All seeded users already have onboarding steps")
            return
        }

        missingOnboardingStepUserIds.forEach { userId ->
            userOnboardingStepStorage.create(UserOnboardingStep.new(userId, primaryOnboardingStepId))
        }
        logger.info("Inserted {} missing onboarding steps for seeded users", missingOnboardingStepUserIds.size)
    }

    private fun ensurePrimaryOnboardingStep(): OnboardingStep =
        runCatching { onboardingStepStorage.findPrimary() }
            .getOrElse {
                onboardingStepStorage.create(
                    OnboardingStep(
                        id = DEFAULT_PRIMARY_ONBOARDING_STEP_ID,
                        nextStepId = null,
                        isPrimary = true,
                    )
                )
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
        val workExperience: List<WorkExperience>,
    ) {
        fun toUser(encodedPassword: String): User =
            User.new(
                id = id,
                email = email,
                password = encodedPassword,
                roles = roles,
            )

        fun toUserProfile(): UserProfile =
            UserProfile.new(
                userId = id,
                name = name,
                sex = sex,
                avatarId = avatarId,
                birthday = birthday,
                education = education,
                speciality = speciality,
                workExperience = workExperience,
            )
    }

    private companion object {
        private val logger = LoggerFactory.getLogger(TestUsersStartupSeeder::class.java)
        private const val DEFAULT_PRIMARY_ONBOARDING_STEP_ID = "primary"

        private val SEED_USERS = listOf(
            SeedUser(
                id = UUID.fromString("4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101"),
                email = "vladislav_fedotov_official@bk.ru",
                roles = listOf(UserRole.ADMIN, UserRole.USER),
                name = "Alex Admin",
                sex = Sex.SEX_OTHER,
                birthday = Instant.parse("1993-05-17T00:00:00Z"),
                avatarId = "viktor-avatar.png",
                education = Education.EDUCATION_LEVEL_MASTER,
                speciality = Speciality.SPECIALTY_PROJECT_MANAGEMENT,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_PROJECT_MANAGEMENT,
                        startedAt = Instant.parse("2018-02-01T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("8b9d91ee-8673-4e3d-a39c-3bfa3a9b8f11"),
                email = "vacherkasskiy@yandex.ru",
                roles = listOf(UserRole.USER),
                name = "Nina QA",
                sex = Sex.SEX_FEMALE,
                birthday = Instant.parse("1997-09-08T00:00:00Z"),
                avatarId = "cat-avatar.png",
                education = Education.EDUCATION_LEVEL_BACHELOR,
                speciality = Speciality.SPECIALTY_IT,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2020-06-01T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("34d50c6a-b6bf-4ba8-8798-5dc80df2f3d4"),
                email = "ekaterina.polyah@yandex.ru",
                roles = listOf(UserRole.USER),
                name = "Maks Dev",
                sex = Sex.SEX_MALE,
                birthday = Instant.parse("1995-01-21T00:00:00Z"),
                avatarId = "fox-avatar.png",
                education = Education.EDUCATION_LEVEL_SPECIALIST,
                speciality = Speciality.SPECIALTY_IT,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2019-03-15T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("5d6aeb12-b7b5-484f-9e0e-f53fbb53b973"),
                email = "vdfrolovbukanov@edu.hse.ru",
                roles = listOf(UserRole.USER),
                name = "Olga Design",
                sex = Sex.SEX_FEMALE,
                birthday = Instant.parse("1998-11-30T00:00:00Z"),
                avatarId = "rabbit-avatar.png",
                education = Education.EDUCATION_LEVEL_BACHELOR,
                speciality = Speciality.SPECIALTY_DESIGN,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_DESIGN,
                        startedAt = Instant.parse("2021-04-01T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("9c4c0d61-0f57-46be-9704-aecf5ee0d9a7"),
                email = "internal.manager@vibecheck.local",
                roles = listOf(UserRole.MANAGER, UserRole.USER),
                name = "Ivan Internal",
                sex = Sex.SEX_MALE,
                birthday = Instant.parse("1991-07-12T00:00:00Z"),
                avatarId = "wolf-avatar.png",
                education = Education.EDUCATION_LEVEL_MASTER,
                speciality = Speciality.SPECIALTY_PROJECT_MANAGEMENT,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_PROJECT_MANAGEMENT,
                        startedAt = Instant.parse("2017-01-10T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
        )
    }
}
