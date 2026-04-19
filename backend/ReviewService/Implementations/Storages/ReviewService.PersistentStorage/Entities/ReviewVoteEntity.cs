namespace ReviewService.PersistentStorage.Entities;

public sealed class ReviewVoteEntity
{
    public Guid ReviewId { get; set; }
    public Guid VoterId { get; set; }
    public string Mode { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ReviewEntity Review { get; set; } = null!;
    public UserProfileEntity Voter { get; set; } = null!;
}