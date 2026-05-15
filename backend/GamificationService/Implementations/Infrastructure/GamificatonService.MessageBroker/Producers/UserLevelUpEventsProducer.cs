using Achievements;
using Common;
using Confluent.Kafka;
using GamificatonService.MessageBroker.Abstractions.Producers;
using Google.Protobuf;
using ProtobufTimestamp = Google.Protobuf.WellKnownTypes.Timestamp;

namespace GamificatonService.MessageBroker.Producers;

internal sealed class UserLevelUpEventsProducer(
    IProducer<string, byte[]> producer) : IUserLevelUpEventsProducer
{
    private const string LevelTopic = "gamification-level";

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
                    OccurredAt = ProtobufTimestamp.FromDateTime(occurredAt.UtcDateTime),
                    Source = SourceType.GamificationService
                },
                UserId = userId.ToString(),
                NewLevel = (uint)newLevel,
                LeveledAt = ProtobufTimestamp.FromDateTime(occurredAt.UtcDateTime),
            };

        await producer.ProduceAsync(
            LevelTopic,
            new Message<string, byte[]>
            {
                Key = message.UserId,
                Value = message.ToByteArray()
            },
            ct);
    }
}
