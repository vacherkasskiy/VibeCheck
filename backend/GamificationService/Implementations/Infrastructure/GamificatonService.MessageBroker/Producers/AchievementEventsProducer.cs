using Achievements;
using Common;
using Confluent.Kafka;
using GamificatonService.MessageBroker.Abstractions.Producers;
using Google.Protobuf;
using ProtobufTimestamp = Google.Protobuf.WellKnownTypes.Timestamp;

namespace GamificatonService.MessageBroker.Producers;

internal sealed class AchievementEventsProducer(
    IProducer<string, byte[]> producer)
    : IAchievementEventsProducer
{
    private const string AchievementTopic = "gamification-achievement";

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
                    OccurredAt = ProtobufTimestamp.FromDateTime(grantedAt.UtcDateTime),
                    Source = SourceType.GamificationService
                },
                UserId = userId.ToString(),
                AchievementName = achievementName,
                GrantedAt = ProtobufTimestamp.FromDateTime(grantedAt.UtcDateTime)
            };

        await producer.ProduceAsync(
            AchievementTopic,
            new Message<string, byte[]>
            {
                Key = message.UserId,
                Value = message.ToByteArray()
            },
            ct);
    }
}
