using Google.Protobuf;

namespace GamificationService.Gateway.Kafka.Consumers;

internal interface IKafkaEventHandler<in TEvent>
    where TEvent : class, IMessage<TEvent>
{
    Task HandleAsync(
        TEvent message,
        KafkaConsumedMessageMetadata metadata,
        CancellationToken ct);
}
