using Confluent.Kafka;
using GamificatonService.MessageBroker.Abstractions.Options;

namespace GamificatonService.MessageBroker;

public static class KafkaClientConfigFactory
{
    public static ProducerConfig CreateProducerConfig(KafkaOptions options)
    {
        var config = new ProducerConfig
        {
            BootstrapServers = options.BootstrapServers,
            Acks = Acks.All,
            MessageSendMaxRetries = 10,
            EnableIdempotence = true,
            MaxInFlight = 5,
            CompressionType = CompressionType.Zstd
        };

        ApplySecurity(config, options);
        return config;
    }

    public static ConsumerConfig CreateConsumerConfig(KafkaOptions options, string groupId)
    {
        var config = new ConsumerConfig
        {
            BootstrapServers = options.BootstrapServers,
            GroupId = groupId,
            EnableAutoCommit = false,
            AutoOffsetReset = AutoOffsetReset.Earliest
        };

        ApplySecurity(config, options);
        return config;
    }

    public static AdminClientConfig CreateAdminClientConfig(KafkaOptions options)
    {
        var config = new AdminClientConfig
        {
            BootstrapServers = options.BootstrapServers,
            SocketTimeoutMs = 3000
        };

        ApplySecurity(config, options);
        return config;
    }

    private static void ApplySecurity(ClientConfig config, KafkaOptions options)
    {
        if (!string.IsNullOrWhiteSpace(options.SecurityProtocol))
            config.SecurityProtocol = ParseEnum<SecurityProtocol>(options.SecurityProtocol);

        if (!string.IsNullOrWhiteSpace(options.SaslMechanism))
            config.SaslMechanism = ParseEnum<SaslMechanism>(options.SaslMechanism);

        if (!string.IsNullOrWhiteSpace(options.Username))
            config.SaslUsername = options.Username;

        if (!string.IsNullOrWhiteSpace(options.Password))
            config.SaslPassword = options.Password;
    }

    private static TEnum ParseEnum<TEnum>(string value)
        where TEnum : struct, Enum
    {
        var normalizedValue = Normalize(value);

        foreach (var name in Enum.GetNames<TEnum>())
        {
            if (Normalize(name).Equals(normalizedValue, StringComparison.OrdinalIgnoreCase))
                return Enum.Parse<TEnum>(name);
        }

        throw new InvalidOperationException($"Unsupported Kafka {typeof(TEnum).Name}: {value}");
    }

    private static string Normalize(string value) =>
        value.Replace("_", string.Empty, StringComparison.Ordinal)
            .Replace("-", string.Empty, StringComparison.Ordinal);
}
