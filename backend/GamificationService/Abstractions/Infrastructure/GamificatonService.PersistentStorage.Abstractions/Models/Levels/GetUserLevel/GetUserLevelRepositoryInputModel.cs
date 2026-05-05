namespace GamificatonService.PersistentStorage.Abstractions.Models.Levels.GetUserLevel;

public sealed record GetUserLevelRepositoryInputModel
{
    public required Guid UserId { get; init; }
}