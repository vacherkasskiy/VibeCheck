using Achievements;
using Common;
using GamificatonService.MessageBroker.Abstractions.Producers;
using Google.Protobuf.WellKnownTypes;
using MassTransit;

namespace GamificatonService.MessageBroker.Producers;

internal sealed class AchievementEventsProducer(
    ITopicProducer<AchievementGrantedEvent> producer)
    : IAchievementEventsProducer
{
    public async Task PublishAchievementGrantedAsync(
        Guid userId,
        string achievementName,
        DateTimeOffset grantedAt,
        CancellationToken ct)
    {
        var message = new AchievementGrantedEvent
        {
            Meta = new EventMetadata
            {
                EventId = Guid.NewGuid().ToString(),
                EventType = "achievement.granted",
                AggregateId = userId.ToString(),
                PayloadVersion = 1,
                OccurredAt = Timestamp.FromDateTime(grantedAt.UtcDateTime),
                Source = SourceType.GamificationService
            },
            UserId = userId.ToString(),
            AchievementName = achievementName,
            GrantedAt = Timestamp.FromDateTime(grantedAt.UtcDateTime)
        };

        await producer.Produce(message, ct);
    }
}