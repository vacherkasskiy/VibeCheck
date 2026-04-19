namespace ReviewService.PersistentStorage.Entities;

public sealed class ReviewFlagEntity
{
    public Guid ReviewId { get; set; }
    public Guid FlagId { get; set; }
    public DateTime CreatedAt { get; set; }

    public ReviewEntity Review { get; set; } = null!;
    public FlagEntity Flag { get; set; } = null!;
}