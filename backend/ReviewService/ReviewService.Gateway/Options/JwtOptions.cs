namespace ReviewService.Gateway.Options;

public sealed record JwtOptions
{
    public required string SecretKey { get; set; } = string.Empty;
    public required string Issuer { get; set; } = string.Empty;
    public required string Audience { get; set; } = string.Empty;
    public required string PublicKeyPath { get; set; } = string.Empty;
}
