using GamificatonService.Core.Abstractions.Enums;

namespace GamificatonService.Core.Abstractions.Models.GetMyAchievements;

public sealed record GetMyAchievementsResultModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<MyAchievementItemModel> Achievements { get; init; }
}

public sealed record MyAchievementItemModel
{
    public required Guid AchievementId { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public required string IconId { get; init; }
    public required AchievementStatusOperationEnum Status { get; init; }
    public required ProgressLongModel Progress { get; init; }
    public DateTimeOffset? ObtainedAt { get; init; }
}

public sealed record ProgressLongModel
{
    public required long Current { get; init; }
    public required long Target { get; init; }
}