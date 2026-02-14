namespace GamificatonService.PersistentStorage.Abstractions.Models.GetUserCompletedAchievements;

public sealed record GetUserAchievementsRepositoryOutputModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<UserAchievementRepositoryItemOutputModel> Achievements { get; init; }
}

public sealed record UserAchievementRepositoryItemOutputModel
{
    public required Guid AchievementId { get; init; }
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public required DateTimeOffset ObtainedAt { get; init; }
}