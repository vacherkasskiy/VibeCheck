using Common;
using Google.Protobuf.WellKnownTypes;
using MassTransit;
using Reviews;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.MessageBroker.Abstractions.Producers;
using System.Diagnostics;

namespace ReviewService.MessageBroker.Producers;

internal sealed class ReviewWrittenEventsProducer(
    ITopicProducer<ReviewWrittenEvent> writtenProducer,
    ITopicProducer<ReviewUpdatedEvent> updatedProducer)
    : IReviewEventsProducer
{
    public async Task PublishReviewWrittenAsync(
        Guid reviewId,
        Guid userId,
        DateTimeOffset createdAt,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var message = new ReviewWrittenEvent
            {
                Meta = new EventMetadata
                {
                    EventId = Guid.NewGuid().ToString(),
                    EventType = "review.written",
                    AggregateId = reviewId.ToString(),
                    PayloadVersion = 1,
                    OccurredAt = Timestamp.FromDateTime(createdAt.UtcDateTime),
                    Source = SourceType.ReviewService
                },
                ReviewId = reviewId.ToString(),
                UserId = userId.ToString(),
                CreatedAt = Timestamp.FromDateTime(createdAt.UtcDateTime)
            };

            await writtenProducer.Produce(message, ct);
        }
        catch
        {
            status = "failed";
            ReviewMetrics.RecordOperationError("publish_review_written", "message_broker", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordProducedMessage("ReviewWrittenEventsProducer", "reviews-written", "review.written", status);
            ReviewMetrics.RecordOperationDuration("publish_review_written", "message_broker", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }

    public async Task PublishReviewUpdatedAsync(
        Guid reviewId,
        Guid userId,
        DateTimeOffset updatedAt,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var message = new ReviewUpdatedEvent
            {
                Meta = new EventMetadata
                {
                    EventId = Guid.NewGuid().ToString(),
                    EventType = "review.updated",
                    AggregateId = reviewId.ToString(),
                    PayloadVersion = 1,
                    OccurredAt = Timestamp.FromDateTime(updatedAt.UtcDateTime),
                    Source = SourceType.ReviewService
                },
                ReviewId = reviewId.ToString(),
                UserId = userId.ToString(),
                UpdatedAt = Timestamp.FromDateTime(updatedAt.UtcDateTime)
            };

            await updatedProducer.Produce(message, ct);
        }
        catch
        {
            status = "failed";
            ReviewMetrics.RecordOperationError("publish_review_updated", "message_broker", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordProducedMessage("ReviewWrittenEventsProducer", "reviews-updated", "review.updated", status);
            ReviewMetrics.RecordOperationDuration("publish_review_updated", "message_broker", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
