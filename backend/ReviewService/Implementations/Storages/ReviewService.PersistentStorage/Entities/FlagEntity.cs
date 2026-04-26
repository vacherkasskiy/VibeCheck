using ReviewService.PersistentStorage.Entities.Enums;

namespace ReviewService.PersistentStorage.Entities;

public sealed class FlagEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public FlagCategoryEntityEnum Category { get; set; }
    public string Description { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public ICollection<CompanyFlagEntity> CompanyFlags { get; set; } = new List<CompanyFlagEntity>();
    public ICollection<ReviewFlagEntity> ReviewFlags { get; set; } = new List<ReviewFlagEntity>();
    public ICollection<UserProfileFlagEntity> UserProfileFlags { get; set; } = new List<UserProfileFlagEntity>();
}