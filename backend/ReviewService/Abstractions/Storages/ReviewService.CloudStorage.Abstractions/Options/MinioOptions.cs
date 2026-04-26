namespace ReviewService.CloudStorage.Abstractions.Options;

public sealed record MinioOptions
{
    public required string Endpoint { get; init; }
    public required string PublicEndpoint { get; init; }
    public required string AccessKey { get; init; }
    public required string SecretKey { get; init; }
    public required string Bucket { get; init; }
    public required bool UseSsl { get; init; }
}