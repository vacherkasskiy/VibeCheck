using Common;
using Google.Protobuf.WellKnownTypes;
using MassTransit;
using Reports;
using ReviewService.MessageBroker.Abstractions.Producers;

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
}