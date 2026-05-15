using System.Diagnostics;
using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using Microsoft.Extensions.Logging;
using Subscriptions;

namespace GamificationService.Gateway.Kafka.Consumers;


internal sealed class UserSubscribedEventConsumer(
    IAchievementProgressService achievementProgressService,
    IXpProgressService xpProgressService,
    ILogger<UserSubscribedEventConsumer> logger)
    : IKafkaEventHandler<UserSubscribedEvent>
{
    public async Task HandleAsync(
        UserSubscribedEvent message,
        KafkaConsumedMessageMetadata metadata,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var subscriberUserId = Guid.Parse(message.FollowerId);
            var targetUserId = Guid.Parse(message.TargetUserId);
            var eventId = message.Meta.EventId;
            var aggregateId = message.TargetUserId;
            var occurredAt = message.Meta.OccurredAt.ToDateTimeOffset();

            logger.LogInformation(
                "Consuming {MessageType} subscriberUserId {SubscriberUserId} targetUserId {TargetUserId} topic {Topic} partition {Partition} offset {Offset}",
                nameof(UserSubscribedEvent),
                subscriberUserId,
                targetUserId,
                metadata.Topic,
                metadata.Partition,
                metadata.Offset);

            await achievementProgressService.HandleUserSubscribedAsync(
                subscriberUserId,
                targetUserId,
                ct);

            await xpProgressService.HandleUserSubscribedAsync(
                subscriberUserId,
                targetUserId,
                eventId,
                aggregateId,
                occurredAt,
                ct);

            logger.LogInformation(
                "Consumed {MessageType} targetUserId {TargetUserId} topic {Topic} partition {Partition} offset {Offset} in {ElapsedMs} ms",
                nameof(UserSubscribedEvent),
                targetUserId,
                metadata.Topic,
                metadata.Partition,
                metadata.Offset,
                stopwatch.Elapsed.TotalMilliseconds);
        }
        catch (Exception exception)
        {
            status = "failed";
            GamificationMetrics.RecordOperationError("user_subscribed_consumer", "message_broker", "exception");
            logger.LogError(
                exception,
                "Failed to consume {MessageType} topic {Topic} partition {Partition} offset {Offset}",
                nameof(UserSubscribedEvent),
                metadata.Topic,
                metadata.Partition,
                metadata.Offset);
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
