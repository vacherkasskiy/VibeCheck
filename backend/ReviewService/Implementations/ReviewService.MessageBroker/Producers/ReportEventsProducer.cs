using Common;
using Google.Protobuf.WellKnownTypes;
using MassTransit;
using Reports;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.MessageBroker.Abstractions.Producers;
using System.Diagnostics;

namespace ReviewService.MessageBroker.Producers;

internal sealed class ReportEventsProducer(
    ITopicProducer<ReviewReportedEvent> producer)
    : IReportEventsProducer
{
    public async Task PublishReviewReportedAsync(
        Guid reportId,
        Guid reviewId,
        Guid reporterId,
        int reasonType,
        string? reasonText,
        DateTimeOffset createdAt,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var message = new ReviewReportedEvent
            {
                Meta = new EventMetadata
                {
                    EventId = Guid.NewGuid().ToString(),
                    EventType = "review.reported",
                    AggregateId = reportId.ToString(),
                    PayloadVersion = 1,
                    OccurredAt = Timestamp.FromDateTime(createdAt.UtcDateTime),
                    Source = SourceType.ReviewService
                },
                ReportId = reportId.ToString(),
                ReviewId = reviewId.ToString(),
                ReporterUserId = reporterId.ToString(),
                ReasonType = (ReportReasonType)reasonType,
                ReasonText = reasonText ?? string.Empty,
                CreatedAt = Timestamp.FromDateTime(createdAt.UtcDateTime)
            };

            await producer.Produce(message, ct);
        }
        catch
        {
            status = "failed";
            ReviewMetrics.RecordOperationError("publish_review_reported", "message_broker", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordProducedMessage("ReportEventsProducer", "reports", "review.reported", status);
            ReviewMetrics.RecordOperationDuration("publish_review_reported", "message_broker", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
