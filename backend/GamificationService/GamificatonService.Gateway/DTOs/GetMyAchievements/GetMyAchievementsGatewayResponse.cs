namespace GamificatonService.Gateway.DTOs.GetMyAchievements;

public sealed record GetMyAchievementsGatewayResponse
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

public sealed record ProgressDto
{
    public required long Current { get; init; }
    public required long Target { get; init; }
}

public enum AchievementStatus
{
    Completed = 0,
    InProgress = 1,
    NotStarted = 2
}