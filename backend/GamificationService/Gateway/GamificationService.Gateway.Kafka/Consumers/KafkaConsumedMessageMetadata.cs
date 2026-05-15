namespace GamificationService.Gateway.Kafka.Consumers;

internal sealed record KafkaConsumedMessageMetadata(
    string Topic,
    int Partition,
    long Offset);
