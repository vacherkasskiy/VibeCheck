using Common;
using Confluent.Kafka;
using Google.Protobuf;
using Reviews;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.MessageBroker.Abstractions.Producers;
using System.Diagnostics;
using ProtobufTimestamp = Google.Protobuf.WellKnownTypes.Timestamp;

namespace ReviewService.MessageBroker.Producers;

internal sealed class ReviewWrittenEventsProducer(
    IProducer<string, byte[]> producer)
    : IReviewEventsProducer
{
    private const string ReviewsWrittenTopic = "reviews-written";
    private const string ReviewsUpdatedTopic = "reviews-updated";

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
                    OccurredAt = ProtobufTimestamp.FromDateTime(createdAt.UtcDateTime),
                    Source = SourceType.ReviewService
                },
                ReviewId = reviewId.ToString(),
                UserId = userId.ToString(),
                CreatedAt = ProtobufTimestamp.FromDateTime(createdAt.UtcDateTime)
            };

            await producer.ProduceAsync(
                ReviewsWrittenTopic,
                new Message<string, byte[]>
                {
                    Key = message.UserId,
                    Value = message.ToByteArray()
                },
                ct);
        }
        catch
        {
            status = "failed";
            ReviewMetrics.RecordOperationError("publish_review_written", "message_broker", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordProducedMessage("ReviewWrittenEventsProducer", ReviewsWrittenTopic, "review.written", status);
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
                    OccurredAt = ProtobufTimestamp.FromDateTime(updatedAt.UtcDateTime),
                    Source = SourceType.ReviewService
                },
                ReviewId = reviewId.ToString(),
                UserId = userId.ToString(),
                UpdatedAt = ProtobufTimestamp.FromDateTime(updatedAt.UtcDateTime)
            };

            await producer.ProduceAsync(
                ReviewsUpdatedTopic,
                new Message<string, byte[]>
                {
                    Key = message.UserId,
                    Value = message.ToByteArray()
                },
                ct);
        }
        catch
        {
            status = "failed";
            ReviewMetrics.RecordOperationError("publish_review_updated", "message_broker", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordProducedMessage("ReviewWrittenEventsProducer", ReviewsUpdatedTopic, "review.updated", status);
            ReviewMetrics.RecordOperationDuration("publish_review_updated", "message_broker", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
