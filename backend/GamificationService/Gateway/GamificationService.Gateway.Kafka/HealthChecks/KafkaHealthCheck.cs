using Confluent.Kafka;
using GamificatonService.MessageBroker.Abstractions.Options;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace GamificationService.Gateway.Kafka.HealthChecks;

public sealed class KafkaHealthCheck : IHealthCheck
{
    private readonly KafkaOptions _kafka;

    public KafkaHealthCheck(IOptions<KafkaOptions> kafkaOptions)
        => _kafka = kafkaOptions.Value;

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken ct = default)
    {
        try
        {
            var config = new AdminClientConfig
            {
                BootstrapServers = _kafka.BootstrapServers,
                SaslUsername = _kafka.Username,
                SaslPassword = _kafka.Password,
                SocketTimeoutMs = 3000
            };

            if (Enum.TryParse<SecurityProtocol>(_kafka.SecurityProtocol, true, out var securityProtocol))
                config.SecurityProtocol = securityProtocol;

            if (Enum.TryParse<SaslMechanism>(_kafka.SaslMechanism, true, out var saslMechanism))
                config.SaslMechanism = saslMechanism;

            using var adminClient = new AdminClientBuilder(config).Build();
            var metadata = adminClient.GetMetadata(TimeSpan.FromSeconds(3));

            return Task.FromResult(metadata.Brokers.Count > 0
                ? HealthCheckResult.Healthy("kafka is reachable")
                : HealthCheckResult.Unhealthy("kafka returned no brokers"));
        }
        catch (Exception ex)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("kafka is NOT reachable", ex));
        }
    }
}
