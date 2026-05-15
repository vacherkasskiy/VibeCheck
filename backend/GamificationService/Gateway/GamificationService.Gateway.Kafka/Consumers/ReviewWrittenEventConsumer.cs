using System.Diagnostics;
using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using Microsoft.Extensions.Logging;
using Reviews;

namespace GamificationService.Gateway.Kafka.Consumers;

internal sealed class ReviewWrittenEventConsumer(
    IAchievementProgressService achievementProgressService,
    IXpProgressService xpProgressService,
    ILogger<ReviewWrittenEventConsumer> logger)
    : IKafkaEventHandler<ReviewWrittenEvent>
{
    public async Task HandleAsync(
        ReviewWrittenEvent message,
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
                nameof(ReviewWrittenEvent),
                userId,
                aggregateId,
                metadata.Topic,
                metadata.Partition,
                metadata.Offset);

            await achievementProgressService.HandleReviewWrittenAsync(
                userId,
                ct);

            await xpProgressService.HandleReviewWrittenAsync(
                userId,
                eventId,
                aggregateId,
                occurredAt,
                ct);

            logger.LogInformation(
                "Consumed {MessageType} reviewId {ReviewId} topic {Topic} partition {Partition} offset {Offset} in {ElapsedMs} ms",
                nameof(ReviewWrittenEvent),
                aggregateId,
                metadata.Topic,
                metadata.Partition,
                metadata.Offset,
                stopwatch.Elapsed.TotalMilliseconds);
        }
        catch (Exception exception)
        {
            status = "failed";
            GamificationMetrics.RecordOperationError("review_written_consumer", "message_broker", "exception");
            logger.LogError(
                exception,
                "Failed to consume {MessageType} topic {Topic} partition {Partition} offset {Offset}",
                nameof(ReviewWrittenEvent),
                metadata.Topic,
                metadata.Partition,
                metadata.Offset);
            throw;
        }
        finally
        {
            GamificationMetrics.RecordConsumerMessage("ReviewWrittenEventConsumer", "reviews-written", status);
            GamificationMetrics.RecordOperationDuration(
                "review_written_consumer",
                "message_broker",
                status,
                stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
