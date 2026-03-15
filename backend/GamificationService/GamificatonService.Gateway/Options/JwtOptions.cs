namespace GamificatonService.Gateway.Options;

public sealed record JwtOptions
{
    public required string SecretKey { get; set; }
}