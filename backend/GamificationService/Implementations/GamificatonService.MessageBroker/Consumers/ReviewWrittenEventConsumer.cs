using GamificatonService.Core.Abstractions.Handlers;
using MassTransit;
using Reviews;

namespace GamificatonService.MessageBroker.Consumers;

internal sealed class ReviewWrittenEventConsumer(
    IAchievementProgressService achievementProgressService,
    IXpProgressService xpProgressService)
    : IConsumer<ReviewWrittenEvent>
{
    public async Task Consume(ConsumeContext<ReviewWrittenEvent> context)
    {
        var message = context.Message;

        var userId = Guid.Parse(message.UserId);
        var eventId = message.Meta.EventId;
        var aggregateId = message.ReviewId;
        var occurredAt = message.Meta.OccurredAt.ToDateTimeOffset();

        await achievementProgressService.HandleReviewWrittenAsync(
            userId,
            context.CancellationToken);

        await xpProgressService.HandleReviewWrittenAsync(
            userId,
            eventId,
            aggregateId,
            occurredAt,
            context.CancellationToken);
    }
}