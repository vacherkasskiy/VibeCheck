namespace ReviewService.PersistentStorage.Entites;

public sealed class ReviewEntity
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public Guid AuthorId { get; set; }
    public string? Text { get; set; }
    public long LikesCount { get; set; }
    public long DislikesCount { get; set; }
    public long Score { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }

    public CompanyEntity Company { get; set; } = null!;
    public UserProfileEntity Author { get; set; } = null!;

    public ICollection<ReviewFlagEntity> ReviewFlags { get; set; } = new List<ReviewFlagEntity>();
    public ICollection<ReviewVoteEntity> ReviewVotes { get; set; } = new List<ReviewVoteEntity>();
    public ICollection<ReviewReportEntity> ReviewReports { get; set; } = new List<ReviewReportEntity>();
}