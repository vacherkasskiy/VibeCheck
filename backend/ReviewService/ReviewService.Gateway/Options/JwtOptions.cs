namespace ReviewService.Gateway.Options;

public sealed record JwtOptions
{
    public required string SecretKey { get; set; }
}