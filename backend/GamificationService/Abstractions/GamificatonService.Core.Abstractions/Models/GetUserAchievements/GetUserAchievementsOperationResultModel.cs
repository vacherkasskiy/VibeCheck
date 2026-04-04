namespace GamificatonService.Core.Abstractions.Models.GetUserAchievements;

public sealed record GetUserAchievementsOperationResultModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<UserAchievementItemOperationModel> Achievements { get; init; }
}

public sealed record UserAchievementItemOperationModel
{
    public required Guid AchievementId { get; init; }
    public required string Name { get; init; }
    public required string IconUrl { get; init; }
    public required DateTimeOffset ObtainedAt { get; init; }
}