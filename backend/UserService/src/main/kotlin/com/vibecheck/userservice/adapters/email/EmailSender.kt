package com.vibecheck.userservice.adapters.email

import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class EmailSender(
    private val mailSender: JavaMailSender,
    @Value("\${spring.mail.username}") private val fromAddress: String,
) {
    fun sendRegistrationCode(email: String, confirmCode: Int) {
        val message = SimpleMailMessage().apply {
            setTo(email)
            subject = "Код регистрации на платформе VibeCheck"
            text = "Ваш код регистрации: $confirmCode"
            from = fromAddress
        }

        mailSender.send(message)
    }

    fun sendPasswordConfirmationCode(email: String, confirmCode: Int) {
        val message = SimpleMailMessage().apply {
            setTo(email)
            subject = "Сброс пароля на платформе VibeCheck"
            text = "Ваш код подтверждения сброса пароля: $confirmCode"
            from = fromAddress
        }

        mailSender.send(message)
    }

    fun sendNewLoginDeviceNotification(email: String, userAgent: String, ipAddress: String?, loggedAt: Instant) {
        val ipLine = ipAddress?.let { "\nIP-адрес: $it" } ?: ""
        val message = SimpleMailMessage().apply {
            setTo(email)
            subject = "Новый вход в VibeCheck"
            text =
                "Мы заметили вход в ваш аккаунт с нового устройства или браузера.\n" +
                    "Время: $loggedAt\n" +
                    "Устройство/браузер: $userAgent$ipLine\n\n" +
                    "Если это были не вы, рекомендуем сменить пароль."
            from = fromAddress
        }

        mailSender.send(message)
    }
}
