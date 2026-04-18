package com.vibecheck.userservice.adapters.email

import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class EmailSender(
    private val mailSender: JavaMailSender
) {
    fun sendRegistrationCode(email: String, confirmCode: Int) {
        val message = SimpleMailMessage().apply {
            setTo(email)
            subject = "Код регистрации на платформе VibeCheck"
            text = "Ваш код регистрации: $confirmCode"
            from = "vvfedotov@edu.hse.ru"
        }

        mailSender.send(message)
    }

    fun sendPasswordConfirmationCode(email: String, confirmCode: Int) {
        val message = SimpleMailMessage().apply {
            setTo(email)
            subject = "Сброс пароля на платформе VibeCheck"
            text = "Ваш код подтверждения сброса пароля: $confirmCode"
            from = "vvfedotov@edu.hse.ru"
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
            from = "vvfedotov@edu.hse.ru"
        }

        mailSender.send(message)
    }
}
