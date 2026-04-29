using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using MassTransit;
using Microsoft.Extensions.Logging;
using Reviews;
using System.Diagnostics;

namespace GamificatonService.MessageBroker.Consumers;


internal sealed class ReviewLikedEventConsumer(
    IAchievementProgressService achievementProgressService,
    IXpProgressService xpProgressService,
    ILogger<ReviewLikedEventConsumer> logger)
    : IConsumer<ReviewLikedEvent>
{
    public async Task Consume(ConsumeContext<ReviewLikedEvent> context)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var message = context.Message;

            var likedByUserId = Guid.Parse(message.LikedByUserId);
            var reviewAuthorId = Guid.Parse(message.ReviewAuthorId);
            var eventId = message.Meta.EventId;
            var aggregateId = message.ReviewId;
            var occurredAt = message.Meta.OccurredAt.ToDateTimeOffset();
            var voteMode = string.IsNullOrWhiteSpace(message.VoteMode)
                ? "like"
                : message.VoteMode;

            logger.LogInformation(
                "Consuming {MessageType} likedByUserId {LikedByUserId} reviewAuthorId {ReviewAuthorId} reviewId {ReviewId} voteMode {VoteMode} messageId {MessageId} correlationId {CorrelationId}",
                nameof(ReviewLikedEvent),
                likedByUserId,
                reviewAuthorId,
                aggregateId,
                voteMode,
                context.MessageId,
                context.CorrelationId);

            await achievementProgressService.HandleReviewReactedAsync(
                likedByUserId,
                reviewAuthorId,
                voteMode,
                context.CancellationToken);

            await xpProgressService.HandleReviewReactedAsync(
                likedByUserId,
                reviewAuthorId,
                voteMode,
                eventId,
                aggregateId,
                occurredAt,
                context.CancellationToken);

            logger.LogInformation(
                "Consumed {MessageType} reviewId {ReviewId} in {ElapsedMs} ms",
                nameof(ReviewLikedEvent),
                aggregateId,
                stopwatch.Elapsed.TotalMilliseconds);
        }
        catch (Exception exception)
        {
            status = "failed";
            GamificationMetrics.RecordOperationError("review_liked_consumer", "message_broker", "exception");
            logger.LogError(
                exception,
                "Failed to consume {MessageType} messageId {MessageId} correlationId {CorrelationId}",
                nameof(ReviewLikedEvent),
                context.MessageId,
                context.CorrelationId);
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
