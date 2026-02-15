namespace ReviewService.Core.Abstractions.Models.Companies;

public sealed record FlagCountModel
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required long Count { get; init; }
}