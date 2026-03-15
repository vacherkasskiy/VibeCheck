namespace ReviewService.PersistentStorage.Entites;

public sealed class CompanyFlagEntity
{
    public Guid CompanyId { get; set; }
    public Guid FlagId { get; set; }
    public long ReviewsCount { get; set; }
    public DateTime UpdatedAt { get; set; }

    public CompanyEntity Company { get; set; } = null!;
    public FlagEntity Flag { get; set; } = null!;
}