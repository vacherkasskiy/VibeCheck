using Common;
using Confluent.Kafka;
using Google.Protobuf;
using Reports;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.MessageBroker.Abstractions.Producers;
using System.Diagnostics;
using ProtobufTimestamp = Google.Protobuf.WellKnownTypes.Timestamp;

namespace ReviewService.MessageBroker.Producers;

internal sealed class ReportEventsProducer(
    IProducer<string, byte[]> producer)
    : IReportEventsProducer
{
    private const string ReportsTopic = "reports";

    public async Task PublishReviewReportedAsync(
        Guid reportId,
        Guid reviewId,
        Guid targetUserId,
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
                    OccurredAt = ProtobufTimestamp.FromDateTime(createdAt.UtcDateTime),
                    Source = SourceType.ReviewService
                },
                ReportId = reportId.ToString(),
                TargetUserId = targetUserId.ToString(),
                ReviewId = reviewId.ToString(),
                ReporterUserId = reporterId.ToString(),
                ReasonType = MapReasonType(reasonType),
                ReasonText = reasonText ?? string.Empty,
                CreatedAt = ProtobufTimestamp.FromDateTime(createdAt.UtcDateTime)
            };

            await producer.ProduceAsync(
                ReportsTopic,
                new Message<string, byte[]>
                {
                    Key = message.TargetUserId,
                    Value = message.ToByteArray()
                },
                ct);
        }
        catch
        {
            status = "failed";
            ReviewMetrics.RecordOperationError("publish_review_reported", "message_broker", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordProducedMessage("ReportEventsProducer", ReportsTopic, "review.reported", status);
            ReviewMetrics.RecordOperationDuration("publish_review_reported", "message_broker", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }

    private static ReportReasonType MapReasonType(int reasonType)
        => reasonType switch
        {
            0 => ReportReasonType.SpamOrAdvertisement,
            1 => ReportReasonType.HarassmentOrInsult,
            2 => ReportReasonType.HateSpeech,
            3 => ReportReasonType.Other,
            4 => ReportReasonType.ThreatOrViolence,
            99 => ReportReasonType.Other,
            _ => ReportReasonType.ReportReasonUnspecified
        };
}
