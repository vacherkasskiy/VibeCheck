namespace GamificatonService.Gateway.DTOs;

// -------------------------
// achievements dto (me)
// -------------------------

public sealed record GetMyAchievementsResponse
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<MyAchievementItemDto> Achievements { get; init; }
}

public sealed record MyAchievementItemDto
{
    public required Guid AchievementId { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public required string IconId { get; init; }
    public required AchievementStatus Status { get; init; }
    public required ProgressDto Progress { get; init; }
    public DateTimeOffset? ObtainedAt { get; init; }
}

public enum AchievementStatus
{
    Completed = 0,
    InProgress = 1,
    NotStarted = 2
}

/// <summary>
/// фильтр для /users/me/achievements
/// </summary>
public enum MyAchievementsFilterStatus
{
    All = 0,
    Completed = 1,
    Uncompleted = 2
}

// -------------------------
// achievements dto (other user)
// -------------------------

public sealed record GetUserAchievementsResponse
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<UserAchievementItemDto> Achievements { get; init; }
}

public sealed record UserAchievementItemDto
{
    public required Guid AchievementId { get; init; }
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public required DateTimeOffset ObtainedAt { get; init; }
}

// -------------------------
// level dto
// -------------------------

public sealed record GetLevelResponse
{
    public required int CurrentLevel { get; init; }
    public required ProgressIntDto Progress { get; init; }
}

// общие прогрессы
public sealed record ProgressDto
{
    public required long Current { get; init; }
    public required long Target { get; init; }
}

public sealed record ProgressIntDto
{
    public required int Current { get; init; }
    public required int Target { get; init; }
}