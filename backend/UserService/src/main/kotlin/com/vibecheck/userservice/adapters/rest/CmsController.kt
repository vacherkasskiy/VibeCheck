package com.vibecheck.userservice.adapters.rest

import com.vibecheck.userservice.adapters.rest.dto.InternalReportsPageDto
import com.vibecheck.userservice.adapters.rest.dto.toDto
import com.vibecheck.userservice.usecase.InternalReportsSelection
import com.vibecheck.userservice.usecase.ReportClosing
import com.vibecheck.userservice.usecase.UserBan
import com.vibecheck.userservice.usecase.UserUnban
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/internal")
class CmsController(
    private val internalReportsSelection: InternalReportsSelection,
    private val reportClosing: ReportClosing,
    private val userBan: UserBan,
    private val userUnban: UserUnban,
) {
    @GetMapping("/reports")
    fun getReports(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): InternalReportsPageDto = internalReportsSelection.select(page, size).toDto()

    @PostMapping("/reports/{reportId}/close")
    fun closeReport(@PathVariable reportId: String) {
        reportClosing.close(reportId)
    }

    @PostMapping("/users/{userId}/ban")
    fun banUser(@PathVariable userId: UUID) {
        userBan.ban(userId)
    }

    @PostMapping("/users/{userId}/unban")
    fun unbanUser(@PathVariable userId: UUID) {
        userUnban.unban(userId)
    }
}
