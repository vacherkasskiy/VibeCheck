namespace GamificatonService.PersistentStorage.Entities;

public sealed class UserLevelEntity
{
    public Guid UserId { get; set; }

    public long TotalXp { get; set; }
    public int CurrentLevel { get; set; }

    public DateTime UpdatedAt { get; set; }
}