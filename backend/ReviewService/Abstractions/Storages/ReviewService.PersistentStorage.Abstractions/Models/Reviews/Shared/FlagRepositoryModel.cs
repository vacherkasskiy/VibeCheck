namespace ReviewService.PersistentStorage.Abstractions.Models.Reviews.Shared;

public sealed record FlagRepositoryModel
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
}