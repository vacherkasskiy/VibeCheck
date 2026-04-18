using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using MassTransit;
using Subscriptions;
using System.Diagnostics;

namespace GamificatonService.MessageBroker.Consumers;


internal sealed class UserSubscribedEventConsumer(
    IAchievementProgressService achievementProgressService,
    IXpProgressService xpProgressService)
    : IConsumer<UserSubscribedEvent>
{
    public async Task Consume(ConsumeContext<UserSubscribedEvent> context)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
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
        catch
        {
            status = "failed";
            GamificationMetrics.RecordOperationError("user_subscribed_consumer", "message_broker", "exception");
            throw;
        }
        finally
        {
            GamificationMetrics.RecordConsumerMessage("UserSubscribedEventConsumer", "subscriptions", status);
            GamificationMetrics.RecordOperationDuration(
                "user_subscribed_consumer",
                "message_broker",
                status,
                stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
