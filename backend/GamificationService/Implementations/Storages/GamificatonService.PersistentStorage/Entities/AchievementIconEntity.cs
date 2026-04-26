namespace GamificatonService.PersistentStorage.Entities;

public sealed class AchievementIconEntity
{
    // в схеме varchar(128)
    public Guid Id { get; set; }

    public string Bucket { get; set; } = null!;
    public string ObjectKey { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public string Etag { get; set; } = null!;
    public long SizeBytes { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<AchievementEntity> Achievements { get; set; } = new List<AchievementEntity>();
}