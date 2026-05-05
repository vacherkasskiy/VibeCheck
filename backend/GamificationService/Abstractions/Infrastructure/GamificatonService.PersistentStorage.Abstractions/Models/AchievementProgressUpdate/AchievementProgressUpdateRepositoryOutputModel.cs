namespace GamificatonService.PersistentStorage.Abstractions.Models.AchievementProgressUpdate;

public sealed record AchievementProgressUpdateRepositoryOutputModel
{
    public required Guid UserId { get; init; }
    public required Guid AchievementId { get; init; }
    public required string AchievementName { get; init; }
    public required long ProgressCurrent { get; init; }
    public required bool WasJustObtained { get; init; }
    public required long AchievementXpReward { get; init; }
    public DateTimeOffset? ObtainedAt { get; init; }
}