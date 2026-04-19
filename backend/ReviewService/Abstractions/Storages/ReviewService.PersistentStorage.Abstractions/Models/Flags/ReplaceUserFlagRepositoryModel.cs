namespace ReviewService.PersistentStorage.Abstractions.Models.Flags;

public sealed record ReplaceUserFlagRepositoryModel
{
    public required Guid FlagId { get; init; }
    public required UserFlagColorRepositoryEnum Color { get; init; }
    public required int Weight { get; init; }
}

public enum UserFlagColorRepositoryEnum
{
    Red = 1,
    Green = 2
}