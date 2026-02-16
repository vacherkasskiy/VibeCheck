namespace ReviewService.PersistentStorage.Abstractions.Models.Companies.Shared;

public sealed record FlagCountRepositoryModel
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required long Count { get; init; }
}