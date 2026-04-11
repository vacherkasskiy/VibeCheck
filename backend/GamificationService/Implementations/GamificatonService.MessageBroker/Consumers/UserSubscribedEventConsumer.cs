using GamificatonService.Core.Abstractions.Handlers;
using MassTransit;
using Subscriptions;

namespace GamificatonService.MessageBroker.Consumers;


internal sealed class UserSubscribedEventConsumer(
    IAchievementProgressService achievementProgressService,
    IXpProgressService xpProgressService)
    : IConsumer<UserSubscribedEvent>
{
    public async Task Consume(ConsumeContext<UserSubscribedEvent> context)
    {
        var message = context.Message;

        var subscriberUserId = Guid.Parse(message.FollowerId);
        var targetUserId = Guid.Parse(message.TargetUserId);
        var eventId = message.Meta.EventId;
        var aggregateId = message.TargetUserId;
        var occurredAt = message.Meta.OccurredAt.ToDateTimeOffset();

        await achievementProgressService.HandleUserSubscribedAsync(
            subscriberUserId,
            targetUserId,
            context.CancellationToken);

        await xpProgressService.HandleUserSubscribedAsync(
            subscriberUserId,
            targetUserId,
            eventId,
            aggregateId,
            occurredAt,
            context.CancellationToken);
    }
}