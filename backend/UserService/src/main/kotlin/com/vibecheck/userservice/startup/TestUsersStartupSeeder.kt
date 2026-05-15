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
                email = "anton_s@vibecheck.local",
                roles = listOf(UserRole.USER, UserRole.ADMIN),
                name = "Anton",
                sex = Sex.SEX_MALE,
                birthday = Instant.parse("1997-04-14T00:00:00Z"),
                avatarId = "viktor-avatar.png",
                education = Education.EDUCATION_LEVEL_BACHELOR,
                speciality = Speciality.SPECIALTY_IT,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2021-05-01T00:00:00Z"),
                        endedAt = Instant.parse("2023-05-01T00:00:00Z"),
                    ),
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2023-05-01T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("af7f7d50-30f8-4d72-a55d-f5fa4a728102"),
                email = "lena_dev@vibecheck.local",
                roles = listOf(UserRole.USER),
                name = "Lena",
                sex = Sex.SEX_FEMALE,
                birthday = Instant.parse("1996-08-22T00:00:00Z"),
                avatarId = "cat-avatar.png",
                education = Education.EDUCATION_LEVEL_MASTER,
                speciality = Speciality.SPECIALTY_IT,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2019-05-01T00:00:00Z"),
                        endedAt = Instant.parse("2024-05-01T00:00:00Z"),
                    ),
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2024-05-01T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103"),
                email = "igor_backend@vibecheck.local",
                roles = listOf(UserRole.USER),
                name = "Igor",
                sex = Sex.SEX_MALE,
                birthday = Instant.parse("1995-12-03T00:00:00Z"),
                avatarId = "fox-avatar.png",
                education = Education.EDUCATION_LEVEL_BACHELOR,
                speciality = Speciality.SPECIALTY_IT,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2022-05-01T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("4b84d5b3-c1cc-4322-bca0-d11e0b52d104"),
                email = "maria_pm@vibecheck.local",
                roles = listOf(UserRole.USER),
                name = "Maria",
                sex = Sex.SEX_FEMALE,
                birthday = Instant.parse("1994-11-30T00:00:00Z"),
                avatarId = "rabbit-avatar.png",
                education = Education.EDUCATION_LEVEL_BACHELOR,
                speciality = Speciality.SPECIALTY_PROJECT_MANAGEMENT,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_PROJECT_MANAGEMENT,
                        startedAt = Instant.parse("2019-05-01T00:00:00Z"),
                        endedAt = Instant.parse("2022-05-01T00:00:00Z"),
                    ),
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_PROJECT_MANAGEMENT,
                        startedAt = Instant.parse("2022-05-01T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("e8d44aa8-59f8-47f8-90b8-8e367191c105"),
                email = "denis_data@vibecheck.local",
                roles = listOf(UserRole.USER),
                name = "Denis",
                sex = Sex.SEX_MALE,
                birthday = Instant.parse("1993-07-12T00:00:00Z"),
                avatarId = "wolf-avatar.png",
                education = Education.EDUCATION_LEVEL_MASTER,
                speciality = Speciality.SPECIALTY_ANALYTICS,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_ANALYTICS,
                        startedAt = Instant.parse("2021-05-01T00:00:00Z"),
                        endedAt = Instant.parse("2023-05-01T00:00:00Z"),
                    ),
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_ANALYTICS,
                        startedAt = Instant.parse("2023-05-01T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("b2d5d983-1f53-4e0e-b8f4-f3c016350106"),
                email = "kate_hr@vibecheck.local",
                roles = listOf(UserRole.USER),
                name = "Kate",
                sex = Sex.SEX_FEMALE,
                birthday = Instant.parse("1998-02-11T00:00:00Z"),
                avatarId = "panda-avatar.png",
                education = Education.EDUCATION_LEVEL_BACHELOR,
                speciality = Speciality.SPECIALTY_DESIGN,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_DESIGN,
                        startedAt = Instant.parse("2022-05-01T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("87cc4d53-2b39-4428-89d8-24e1d3f3e107"),
                email = "nikita_go@vibecheck.local",
                roles = listOf(UserRole.USER),
                name = "Nikita",
                sex = Sex.SEX_MALE,
                birthday = Instant.parse("1997-09-18T00:00:00Z"),
                avatarId = "dog-avatar.png",
                education = Education.EDUCATION_LEVEL_BACHELOR,
                speciality = Speciality.SPECIALTY_IT,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2023-05-01T00:00:00Z"),
                        endedAt = Instant.parse("2024-09-01T00:00:00Z"),
                    ),
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2024-09-01T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("6380aa08-a1f6-4ee5-9d3b-4f06e7fb8108"),
                email = "olga_qa@vibecheck.local",
                roles = listOf(UserRole.USER),
                name = "Olga",
                sex = Sex.SEX_FEMALE,
                birthday = Instant.parse("1998-06-09T00:00:00Z"),
                avatarId = "hedgehog-avatar.png",
                education = Education.EDUCATION_LEVEL_BACHELOR,
                speciality = Speciality.SPECIALTY_IT,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2021-05-01T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("5b0df38f-8bba-40d7-a593-ecc4bd1e8109"),
                email = "roman_arch@vibecheck.local",
                roles = listOf(UserRole.USER),
                name = "Roman",
                sex = Sex.SEX_MALE,
                birthday = Instant.parse("1992-03-27T00:00:00Z"),
                avatarId = "turtle-avatar.png",
                education = Education.EDUCATION_LEVEL_MASTER,
                speciality = Speciality.SPECIALTY_IT,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2018-05-01T00:00:00Z"),
                        endedAt = Instant.parse("2023-05-01T00:00:00Z"),
                    ),
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_IT,
                        startedAt = Instant.parse("2023-05-01T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
            SeedUser(
                id = UUID.fromString("a4f9a730-6a71-41cb-97a1-365a4f4b6110"),
                email = "sonya_ui@vibecheck.local",
                roles = listOf(UserRole.USER),
                name = "Sonya",
                sex = Sex.SEX_FEMALE,
                birthday = Instant.parse("1999-01-16T00:00:00Z"),
                avatarId = "cat-avatar.png",
                education = Education.EDUCATION_LEVEL_BACHELOR,
                speciality = Speciality.SPECIALTY_DESIGN,
                workExperience = listOf(
                    WorkExperience(
                        speciality = Speciality.SPECIALTY_DESIGN,
                        startedAt = Instant.parse("2023-05-01T00:00:00Z"),
                        endedAt = null,
                    ),
                ),
            ),
        )
    }
}
