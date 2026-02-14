namespace GamificatonService.Gateway.DTOs.GetUserAchievements;

public sealed record GetUserAchievementsGatewayResponse
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