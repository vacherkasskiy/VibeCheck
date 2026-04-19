namespace ReviewService.PersistentStorage.Entities;

public sealed class CompanyEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public Guid? IconId { get; set; }
    public string? SiteUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? HrUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public IconEntity? Icon { get; set; }

    public ICollection<CompanyFlagEntity> CompanyFlags { get; set; } = new List<CompanyFlagEntity>();
    public ICollection<ReviewEntity> Reviews { get; set; } = new List<ReviewEntity>();
}