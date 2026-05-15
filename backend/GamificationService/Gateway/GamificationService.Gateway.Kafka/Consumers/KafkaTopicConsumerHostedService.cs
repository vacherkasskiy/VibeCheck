using Confluent.Kafka;
using GamificatonService.Core.Abstractions.Observability;
using GamificatonService.MessageBroker;
using GamificatonService.MessageBroker.Abstractions.Options;
using Google.Protobuf;
using Microsoft.Extensions.Options;

namespace GamificationService.Gateway.Kafka.Consumers;

internal sealed class KafkaTopicConsumerHostedService<TEvent>(
    string topic,
    string groupId,
    MessageParser<TEvent> parser,
    IServiceScopeFactory scopeFactory,
    IOptions<KafkaOptions> options,
    ILogger<KafkaTopicConsumerHostedService<TEvent>> logger)
    : BackgroundService
    where TEvent : class, IMessage<TEvent>
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Yield();

        using var consumer = new ConsumerBuilder<string, byte[]>(
                KafkaClientConfigFactory.CreateConsumerConfig(options.Value, groupId))
            .SetKeyDeserializer(Deserializers.Utf8)
            .SetValueDeserializer(Deserializers.ByteArray)
            .SetErrorHandler((_, error) =>
            {
                logger.LogError(
                    "Kafka consumer error for topic {Topic}: {Reason}",
                    topic,
                    error.Reason);
            })
            .Build();

        consumer.Subscribe(topic);

        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                ConsumeResult<string, byte[]>? consumeResult = null;

                try
                {
                    consumeResult = consumer.Consume(stoppingToken);
                    if (consumeResult?.Message?.Value is null)
                        continue;

                    var message = parser.ParseFrom(consumeResult.Message.Value);
                    var metadata = new KafkaConsumedMessageMetadata(
                        consumeResult.Topic,
                        consumeResult.Partition.Value,
                        consumeResult.Offset.Value);

                    using var scope = scopeFactory.CreateScope();
                    var handler = scope.ServiceProvider.GetRequiredService<IKafkaEventHandler<TEvent>>();

                    await handler.HandleAsync(message, metadata, stoppingToken);
                    consumer.Commit(consumeResult);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (ConsumeException exception)
                {
                    GamificationMetrics.RecordOperationError("kafka_consumer", "message_broker", "consume_exception");
                    logger.LogError(
                        exception,
                        "Failed to consume Kafka message from topic {Topic}",
                        topic);
                }
                catch (Exception exception)
                {
                    GamificationMetrics.RecordOperationError("kafka_consumer", "message_broker", "exception");
                    logger.LogError(
                        exception,
                        "Failed to process Kafka message from topic {Topic} partition {Partition} offset {Offset}",
                        consumeResult?.Topic,
                        consumeResult?.Partition.Value,
                        consumeResult?.Offset.Value);

                    if (consumeResult is not null)
                        consumer.Seek(consumeResult.TopicPartitionOffset);

                    await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
                }
            }
        }
        finally
        {
            consumer.Close();
        }
    }
}
