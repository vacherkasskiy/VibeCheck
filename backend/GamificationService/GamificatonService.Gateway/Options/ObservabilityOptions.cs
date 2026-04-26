namespace GamificatonService.Gateway.Options;

public sealed record ObservabilityOptions
{
    public const string SectionName = nameof(ObservabilityOptions);

    public int MetricsPort { get; init; } = 9464;

    public string MetricsEndpointPath { get; init; } = "/metrics";
}
