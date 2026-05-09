using Achievements;
using Common;
using GamificatonService.MessageBroker.Abstractions.Producers;
using Google.Protobuf.WellKnownTypes;
using MassTransit;

namespace GamificatonService.MessageBroker.Producers;

internal sealed class UserLevelUpEventsProducer(
    ITopicProducer<UserLevelUpEvent> producer) : IUserLevelUpEventsProducer
{
    public async Task PublishUserLevelUpAsync(
        Guid userId,
        int newLevel,
        DateTimeOffset occurredAt,
        CancellationToken ct)
    {
        var message = new UserLevelUpEvent
        {
            Meta = new EventMetadata
            {
                EventId = Guid.NewGuid()
                    .ToString(),
                EventType = "user.level_up",
                AggregateId = userId.ToString(),
                PayloadVersion = 1,
                OccurredAt = Timestamp.FromDateTime(occurredAt.UtcDateTime),
                Source = SourceType.GamificationService
            },
            UserId = userId.ToString(),
            NewLevel = (uint)newLevel,
            LeveledAt = Timestamp.FromDateTime(occurredAt.UtcDateTime),
        };

        await producer.Produce(message, ct);
    }
}