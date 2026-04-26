package com.vibecheck.userservice.adapters.rest

import com.vibecheck.userservice.adapters.rest.auth.AuthProvider
import com.vibecheck.userservice.adapters.rest.dto.OnboardingStepDto
import com.vibecheck.userservice.adapters.rest.dto.toDto
import com.vibecheck.userservice.usecase.UserOnboardingStepCompleting
import com.vibecheck.userservice.usecase.UserOnboardingStepSelection
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/onboarding")
class OnboardingController(
    private val userOnboardingStepSelection: UserOnboardingStepSelection,
    private val userOnboardingStepCompleting: UserOnboardingStepCompleting,
    private val authProvider: AuthProvider
) {
    @GetMapping("/step")
    fun getActualStep(): OnboardingStepDto {
        val userId = authProvider.getUserId()

        return userOnboardingStepSelection.select(userId).toDto()
    }

    @PostMapping("/step")
    fun completeCurrentStep() {
        val userId = authProvider.getUserId()

        userOnboardingStepCompleting.complete(userId)
    }
}