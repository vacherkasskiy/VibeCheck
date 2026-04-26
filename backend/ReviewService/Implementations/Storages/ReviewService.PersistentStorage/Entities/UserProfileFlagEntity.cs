using ReviewService.PersistentStorage.Entities.Enums;

namespace ReviewService.PersistentStorage.Entities;

public sealed class UserProfileFlagEntity
{
    public Guid UserId { get; set; }
    public Guid FlagId { get; set; }

    public UserFlagColorEntityEnum Color { get; set; }

    public int Weight { get; set; }

    public DateTime CreatedAt { get; set; }

    public UserProfileEntity User { get; set; } = null!;
    public FlagEntity Flag { get; set; } = null!;
}