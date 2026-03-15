namespace GamificatonService.PersistentStorage.Entities;

public sealed class AchievementEntity
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;

    // FK -> achievement_icons.id (varchar)
    public Guid IconId { get; set; }

    public long TargetValue { get; set; }
    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public AchievementIconEntity Icon { get; set; } = null!;
    public ICollection<UserAchievementEntity> UserAchievements { get; set; } = new List<UserAchievementEntity>();
}