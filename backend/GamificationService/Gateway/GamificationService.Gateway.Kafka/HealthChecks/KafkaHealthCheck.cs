using Confluent.Kafka;
using GamificatonService.MessageBroker;
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
            using var adminClient = new AdminClientBuilder(
                    KafkaClientConfigFactory.CreateAdminClientConfig(_kafka))
                .Build();
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
