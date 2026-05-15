using System.Diagnostics;
using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using Microsoft.Extensions.Logging;
using Reviews;

namespace GamificationService.Gateway.Kafka.Consumers;

internal sealed class ReviewUpdatedEventConsumer(
    IAchievementProgressService achievementProgressService,
    IXpProgressService xpProgressService,
    ILogger<ReviewUpdatedEventConsumer> logger)
    : IKafkaEventHandler<ReviewUpdatedEvent>
{
    public async Task HandleAsync(
        ReviewUpdatedEvent message,
        KafkaConsumedMessageMetadata metadata,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var userId = Guid.Parse(message.UserId);
            var eventId = message.Meta.EventId;
            var aggregateId = message.ReviewId;
            var occurredAt = message.Meta.OccurredAt.ToDateTimeOffset();

            logger.LogInformation(
                "Consuming {MessageType} userId {UserId} reviewId {ReviewId} topic {Topic} partition {Partition} offset {Offset}",
                nameof(ReviewUpdatedEvent),
                userId,
                aggregateId,
                metadata.Topic,
                metadata.Partition,
                metadata.Offset);

            await achievementProgressService.HandleReviewUpdatedAsync(
                userId,
                ct);

            await xpProgressService.HandleReviewUpdatedAsync(
                userId,
                eventId,
                aggregateId,
                occurredAt,
                ct);

            logger.LogInformation(
                "Consumed {MessageType} reviewId {ReviewId} topic {Topic} partition {Partition} offset {Offset} in {ElapsedMs} ms",
                nameof(ReviewUpdatedEvent),
                aggregateId,
                metadata.Topic,
                metadata.Partition,
                metadata.Offset,
                stopwatch.Elapsed.TotalMilliseconds);
        }
        catch (Exception exception)
        {
            status = "failed";
            GamificationMetrics.RecordOperationError("review_updated_consumer", "message_broker", "exception");
            logger.LogError(
                exception,
                "Failed to consume {MessageType} topic {Topic} partition {Partition} offset {Offset}",
                nameof(ReviewUpdatedEvent),
                metadata.Topic,
                metadata.Partition,
                metadata.Offset);
            throw;
        }
        finally
        {
            GamificationMetrics.RecordConsumerMessage("ReviewUpdatedEventConsumer", "reviews-updated", status);
            GamificationMetrics.RecordOperationDuration(
                "review_updated_consumer",
                "message_broker",
                status,
                stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
