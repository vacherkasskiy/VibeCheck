namespace ReviewService.PersistentStorage.Entites;

public sealed class ReviewReportEntity
{
    public Guid Id { get; set; }
    public Guid ReviewId { get; set; }
    public Guid ReporterId { get; set; }
    public string ReasonType { get; set; } = null!;
    public string? ReasonText { get; set; }
    public DateTime CreatedAt { get; set; }

    public ReviewEntity Review { get; set; } = null!;
    public UserProfileEntity Reporter { get; set; } = null!;
}