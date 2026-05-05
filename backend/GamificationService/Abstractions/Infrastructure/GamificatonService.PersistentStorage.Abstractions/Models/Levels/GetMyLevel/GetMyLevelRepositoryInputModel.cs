namespace GamificatonService.PersistentStorage.Abstractions.Models.Levels.GetMyLevel;

public sealed record GetMyLevelRepositoryInputModel
{
    public required Guid UserId { get; init; }
}