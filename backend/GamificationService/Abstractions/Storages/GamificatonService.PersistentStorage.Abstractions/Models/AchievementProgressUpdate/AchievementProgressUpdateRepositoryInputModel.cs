namespace GamificatonService.PersistentStorage.Abstractions.Models.AchievementProgressUpdate;

public sealed record AchievementProgressUpdateRepositoryInputModel
{
    public required Guid UserId { get; init; }
    public required Guid AchievementId { get; init; }
    public required long Delta { get; init; }
    public required long TargetValue { get; init; }
    public required DateTimeOffset UtcNow { get; init; }
}