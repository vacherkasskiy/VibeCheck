namespace GamificatonService.Core.Abstractions.Models;

// enums для operation-layer (чтобы gateway dto не тащить внутрь core)
public enum MyAchievementsFilterStatusOperationEnum
{
    All = 0,
    Completed = 1,
    Uncompleted = 2
}

public enum AchievementStatusOperationEnum
{
    Completed = 0,
    InProgress = 1,
    NotStarted = 2
}

// -------------------------
// operation models (input)
// -------------------------

public sealed record GetMyAchievementsOperationModel(
    int Take,
    int PageNum,
    MyAchievementsFilterStatusOperationEnum Status);

public sealed record GetUserAchievementsOperationModel(
    Guid UserId,
    long Take,
    long PageNum);

// -------------------------
// result models (output)
// -------------------------

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

// level result model (и для me, и для user)
public sealed record GetLevelResultModel
{
    public required int CurrentLevel { get; init; }
    public required ProgressIntModel Progress { get; init; }
}

// общие прогрессы
public sealed record ProgressLongModel
{
    public required long Current { get; init; }
    public required long Target { get; init; }
}

public sealed record ProgressIntModel
{
    public required int Current { get; init; }
    public required int Target { get; init; }
}