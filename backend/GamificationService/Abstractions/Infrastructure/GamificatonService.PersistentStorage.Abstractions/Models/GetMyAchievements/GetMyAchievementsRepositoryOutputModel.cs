using GamificatonService.PersistentStorage.Abstractions.Enums;

namespace GamificatonService.PersistentStorage.Abstractions.Models.GetMyAchievements;

public sealed record GetMyAchievementsRepositoryOutputModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<MyAchievementRepositoryItemOutputModel> Achievements { get; init; }
}

public sealed record MyAchievementRepositoryItemOutputModel
{
    public required Guid AchievementId { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public required Guid IconId { get; init; }
    public required AchievementStatusRepositoryEnum Status { get; init; }
    public required long ProgressCurrent { get; init; }
    public required long ProgressTarget { get; init; }
    public DateTimeOffset? ObtainedAt { get; init; }
}