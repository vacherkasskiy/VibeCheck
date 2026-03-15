namespace GamificatonService.PersistentStorage.Abstractions.Models.GetUserCompletedAchievements;

public sealed record GetUserAchievementsRepositoryOutputModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<UserAchievementItemRepositoryOutputModel> Achievements { get; init; }
}

public sealed record UserAchievementItemRepositoryOutputModel
{
    public required Guid AchievementId { get; init; }
    public required string Name { get; init; }
    public required Guid IconId { get; init; }
    public required DateTimeOffset ObtainedAt { get; init; }
}