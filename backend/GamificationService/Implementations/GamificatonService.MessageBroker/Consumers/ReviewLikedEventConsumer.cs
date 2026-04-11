using GamificatonService.Core.Abstractions.Handlers;
using MassTransit;
using Reviews;

namespace GamificatonService.MessageBroker.Consumers;


internal sealed class ReviewLikedEventConsumer(
    IAchievementProgressService achievementProgressService,
    IXpProgressService xpProgressService)
    : IConsumer<ReviewLikedEvent>
{
    public async Task Consume(ConsumeContext<ReviewLikedEvent> context)
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
}