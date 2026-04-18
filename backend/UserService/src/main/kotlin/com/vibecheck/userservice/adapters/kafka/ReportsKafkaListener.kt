package com.vibecheck.userservice.adapters.kafka

import com.vibecheck.userservice.usecase.IngestReviewReport
import org.slf4j.LoggerFactory
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.support.Acknowledgment
import org.springframework.stereotype.Service
import reports.ReportEvent

@Service
class ReportsKafkaListener(
    private val ingestReviewReport: IngestReviewReport,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @KafkaListener(
        topics = ["\${user-service.kafka.topic.reports}"],
        groupId = "\${user-service.kafka.consumer.group-id}",
        containerFactory = "reportsKafkaListenerContainerFactory",
    )
    fun onReport(payload: ByteArray, acknowledgment: Acknowledgment) {
        val event = ReportEvent.ReviewReportedEvent.parseFrom(payload)
        val created = ingestReviewReport.ingest(event)

        if (created) {
            log.info("Consumed report eventId={}, reportId={}", event.meta.eventId, event.reportId)
        } else {
            log.info("Skipped duplicate report eventId={}, reportId={}", event.meta.eventId, event.reportId)
        }

        acknowledgment.acknowledge()
    }
}
