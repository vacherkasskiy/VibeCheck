package com.vibecheck.userservice.adapters.email

import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service

@Service
class EmailSender(
    private val mailSender: JavaMailSender
) {
    fun send(email: String, confirmCode: Int) {
        val message = SimpleMailMessage().apply {
            setTo(email)
            subject = "Код регистрации на платформе VibeCheck"
            text = "Ваш код регистрации: $confirmCode"
            from = "vvfedotov@edu.hse.ru"
        }

        mailSender.send(message)
    }
}