using ReviewService.PersistentStorage.Entites.Enums;

namespace ReviewService.PersistentStorage.Entites;

public sealed class UserWorkExperienceEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public SpecializationEntityEnum Specialization { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }

    public UserProfileEntity User { get; set; } = null!;
}