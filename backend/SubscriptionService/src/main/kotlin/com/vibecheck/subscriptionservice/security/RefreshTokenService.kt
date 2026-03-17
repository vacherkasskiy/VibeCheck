package com.vibecheck.subscriptionservice.security

import com.vibecheck.userservice.security.util.TokenHasher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class RefreshTokenService(
    private val jwtProperties: JwtProperties,
    private val refreshTokenSessionRepository: RefreshTokenSessionRepository,
    private val userService: UserService,
    private val jwtService: JwtService,
    private val tokenGenerator: TokenGenerator,
    private val tokenHasher: TokenHasher
) {

    @Transactional
    fun createRefreshToken(
        userId: UUID,
        sessionId: UUID,
        ip: String?,
        userAgent: String?
    ): String {
        val rawRefreshToken = tokenGenerator.generateRefreshToken()
        val tokenHash = tokenHasher.hash(rawRefreshToken)
        val now = Instant.now()
        val expiresAt = now.plus(jwtProperties.refreshTtl)

        val entity = RefreshTokenSessionEntity(
            id = UUID.randomUUID(),
            userId = userId,
            sessionId = sessionId,
            tokenHash = tokenHash,
            expiresAt = expiresAt,
            createdAt = now,
            rotatedAt = null,
            revokedAt = null,
            replacedByTokenHash = null,
            reason = null,
            createdByIp = ip,
            userAgent = userAgent
        )

        refreshTokenSessionRepository.save(entity)

        return rawRefreshToken
    }

    @Transactional
    fun refresh(
        rawRefreshToken: String,
        ip: String?,
        userAgent: String?
    ): RefreshResult {
        val now = Instant.now()
        val currentHash = tokenHasher.hash(rawRefreshToken)

        val currentSession = refreshTokenSessionRepository.findByTokenHash(currentHash)
            .orElseThrow { UnauthorizedException("Invalid refresh token") }

        if (currentSession.revokedAt != null) {
            throw UnauthorizedException("Refresh token revoked")
        }

        if (!currentSession.expiresAt.isAfter(now)) {
            throw UnauthorizedException("Refresh token expired")
        }

        if (currentSession.rotatedAt != null || currentSession.replacedByTokenHash != null) {
            revokeSessionChain(
                sessionId = currentSession.sessionId,
                reason = "reuse_detected",
                revokedAt = now
            )
            throw UnauthorizedException("Refresh token reuse detected")
        }

        val user = userService.getEnabledById(currentSession.userId)

        val newRawRefreshToken = tokenGenerator.generateRefreshToken()
        val newHash = tokenHasher.hash(newRawRefreshToken)
        val newExpiresAt = now.plus(jwtProperties.refreshTtl)

        val newSessionEntity = RefreshTokenSessionEntity(
            id = UUID.randomUUID(),
            userId = currentSession.userId,
            sessionId = currentSession.sessionId,
            tokenHash = newHash,
            expiresAt = newExpiresAt,
            createdAt = now,
            rotatedAt = null,
            revokedAt = null,
            replacedByTokenHash = null,
            reason = null,
            createdByIp = ip,
            userAgent = userAgent
        )

        val rotatedCurrentSession = RefreshTokenSessionEntity(
            id = currentSession.id,
            userId = currentSession.userId,
            sessionId = currentSession.sessionId,
            tokenHash = currentSession.tokenHash,
            expiresAt = currentSession.expiresAt,
            createdAt = currentSession.createdAt,
            rotatedAt = now,
            revokedAt = currentSession.revokedAt,
            replacedByTokenHash = newHash,
            reason = currentSession.reason,
            createdByIp = currentSession.createdByIp,
            userAgent = currentSession.userAgent
        )

        refreshTokenSessionRepository.save(rotatedCurrentSession)
        refreshTokenSessionRepository.save(newSessionEntity)

        val accessToken = jwtService.generateAccessToken(
            user = user,
            sessionId = currentSession.sessionId
        )

        return RefreshResult(
            accessToken = accessToken,
            refreshToken = newRawRefreshToken,
            expiresIn = jwtProperties.accessTtl.toSeconds()
        )
    }

    @Transactional
    fun revokeByRawToken(rawRefreshToken: String, reason: String = "logout") {
        val tokenHash = tokenHasher.hash(rawRefreshToken)

        val currentSession = refreshTokenSessionRepository.findByTokenHash(tokenHash)
            .orElseThrow { UnauthorizedException("Invalid refresh token") }

        revokeSessionChain(
            sessionId = currentSession.sessionId,
            reason = reason,
            revokedAt = Instant.now()
        )
    }

    @Transactional
    fun revokeSessionChain(
        sessionId: UUID,
        reason: String,
        revokedAt: Instant
    ) {
        val sessions = refreshTokenSessionRepository.findAllBySessionId(sessionId)

        sessions.forEach { session ->
            if (session.revokedAt == null) {
                refreshTokenSessionRepository.save(
                    RefreshTokenSessionEntity(
                        id = session.id,
                        userId = session.userId,
                        sessionId = session.sessionId,
                        tokenHash = session.tokenHash,
                        expiresAt = session.expiresAt,
                        createdAt = session.createdAt,
                        rotatedAt = session.rotatedAt,
                        revokedAt = revokedAt,
                        replacedByTokenHash = session.replacedByTokenHash,
                        reason = reason,
                        createdByIp = session.createdByIp,
                        userAgent = session.userAgent
                    )
                )
            }
        }
    }