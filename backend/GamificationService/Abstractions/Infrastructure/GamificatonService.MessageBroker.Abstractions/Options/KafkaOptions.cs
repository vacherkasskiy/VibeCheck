namespace GamificatonService.MessageBroker.Abstractions.Options;

public sealed record KafkaOptions
{
    public required string BootstrapServers { get; init; }
    public required string Username { get; init; }
    public required string Password { get; init; }
    public required string SecurityProtocol { get; init; }
    public required string SaslMechanism { get; init; }
}