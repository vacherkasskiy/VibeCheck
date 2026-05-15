using System.Diagnostics;
using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using Microsoft.Extensions.Logging;
using Reviews;

namespace GamificationService.Gateway.Kafka.Consumers;


internal sealed class ReviewLikedEventConsumer(
    IAchievementProgressService achievementProgressService,
    IXpProgressService xpProgressService,
    ILogger<ReviewLikedEventConsumer> logger)
    : IKafkaEventHandler<ReviewLikedEvent>
{
    public async Task HandleAsync(
        ReviewLikedEvent message,
        KafkaConsumedMessageMetadata metadata,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var likedByUserId = Guid.Parse(message.LikedByUserId);
            var reviewAuthorId = Guid.Parse(message.ReviewAuthorId);
            var eventId = message.Meta.EventId;
            var aggregateId = message.ReviewId;
            var occurredAt = message.Meta.OccurredAt.ToDateTimeOffset();
            var voteMode = string.IsNullOrWhiteSpace(message.VoteMode)
                ? "like"
                : message.VoteMode;

            logger.LogInformation(
                "Consuming {MessageType} likedByUserId {LikedByUserId} reviewAuthorId {ReviewAuthorId} reviewId {ReviewId} voteMode {VoteMode} topic {Topic} partition {Partition} offset {Offset}",
                nameof(ReviewLikedEvent),
                likedByUserId,
                reviewAuthorId,
                aggregateId,
                voteMode,
                metadata.Topic,
                metadata.Partition,
                metadata.Offset);

            await achievementProgressService.HandleReviewReactedAsync(
                likedByUserId,
                reviewAuthorId,
                voteMode,
                ct);

            await xpProgressService.HandleReviewReactedAsync(
                likedByUserId,
                reviewAuthorId,
                voteMode,
                eventId,
                aggregateId,
                occurredAt,
                ct);

            logger.LogInformation(
                "Consumed {MessageType} reviewId {ReviewId} topic {Topic} partition {Partition} offset {Offset} in {ElapsedMs} ms",
                nameof(ReviewLikedEvent),
                aggregateId,
                metadata.Topic,
                metadata.Partition,
                metadata.Offset,
                stopwatch.Elapsed.TotalMilliseconds);
        }
        catch (Exception exception)
        {
            status = "failed";
            GamificationMetrics.RecordOperationError("review_liked_consumer", "message_broker", "exception");
            logger.LogError(
                exception,
                "Failed to consume {MessageType} topic {Topic} partition {Partition} offset {Offset}",
                nameof(ReviewLikedEvent),
                metadata.Topic,
                metadata.Partition,
                metadata.Offset);
            throw;
        }
        finally
        {
            GamificationMetrics.RecordConsumerMessage("ReviewLikedEventConsumer", "reviews-liked", status);
            GamificationMetrics.RecordOperationDuration(
                "review_liked_consumer",
                "message_broker",
                status,
                stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
