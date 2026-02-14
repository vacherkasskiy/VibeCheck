namespace GamificatonService.Core.Abstractions.Models.GetUserAchievements;

public sealed record GetUserAchievementsResultModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<UserAchievementItemModel> Achievements { get; init; }
}

public sealed record UserAchievementItemModel
{
    public required Guid AchievementId { get; init; }
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public required DateTimeOffset ObtainedAt { get; init; }
}