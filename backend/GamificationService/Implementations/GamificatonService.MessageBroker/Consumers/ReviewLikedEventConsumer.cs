using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using MassTransit;
using Reviews;
using System.Diagnostics;

namespace GamificatonService.MessageBroker.Consumers;


internal sealed class ReviewLikedEventConsumer(
    IAchievementProgressService achievementProgressService,
    IXpProgressService xpProgressService)
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

            await achievementProgressService.HandleReviewLikedAsync(
                likedByUserId,
                reviewAuthorId,
                context.CancellationToken);

            await xpProgressService.HandleReviewLikedAsync(
                likedByUserId,
                reviewAuthorId,
                eventId,
                aggregateId,
                occurredAt,
                context.CancellationToken);
        }
        catch
        {
            status = "failed";
            GamificationMetrics.RecordOperationError("review_liked_consumer", "message_broker", "exception");
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
