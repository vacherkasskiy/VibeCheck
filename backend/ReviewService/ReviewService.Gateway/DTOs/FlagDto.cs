namespace ReviewService.Gateway.DTOs;

public sealed record FlagDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
}