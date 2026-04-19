namespace ReviewService.PersistentStorage.Entities;

public sealed class IconEntity
{
    public Guid Id { get; set; }
    public string Bucket { get; set; } = null!;
    public string ObjectKey { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public string Etag { get; set; } = null!;
    public long SizeBytes { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<CompanyEntity> Companies { get; set; } = new List<CompanyEntity>();
}