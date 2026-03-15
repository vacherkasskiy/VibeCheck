namespace ReviewService.PersistentStorage.Entites;

public sealed class CompanyRequestEntity
{
    public Guid Id { get; set; }
    public Guid RequesterUserId { get; set; }
    public string Name { get; set; } = null!;
    public string? SiteUrl { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? DecidedAt { get; set; }
    public Guid? DecidedByUserId { get; set; }
}