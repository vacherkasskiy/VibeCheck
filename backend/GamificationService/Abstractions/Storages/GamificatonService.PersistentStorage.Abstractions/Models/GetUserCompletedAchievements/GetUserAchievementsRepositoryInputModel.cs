namespace GamificatonService.PersistentStorage.Abstractions.Models.GetUserCompletedAchievements;

public sealed record GetUserAchievementsRepositoryInputModel
{
    public required Guid UserId { get; init; }
    public required long Take { get; init; }
    public required long PageNum { get; init; }
}