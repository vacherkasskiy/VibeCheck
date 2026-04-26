namespace GamificatonService.PersistentStorage.Entities;

public sealed class UserAchievementEntity
{
    public Guid UserId { get; set; }
    public Guid AchievementId { get; set; }

    public long ProgressCurrent { get; set; }
    public DateTime? ObtainedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public AchievementEntity Achievement { get; set; } = null!;
}