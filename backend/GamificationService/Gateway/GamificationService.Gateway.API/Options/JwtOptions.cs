namespace GamificationService.Gateway.API.Options;

public sealed record JwtOptions
{
    public required string Issuer { get; set; } = string.Empty;
    public required string Audience { get; set; } = string.Empty;
    public required string PublicKeyPath { get; set; } = string.Empty;
}
