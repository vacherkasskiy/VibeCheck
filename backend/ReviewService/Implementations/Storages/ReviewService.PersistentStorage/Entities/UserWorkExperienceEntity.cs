using ReviewService.PersistentStorage.Entities.Enums;

namespace ReviewService.PersistentStorage.Entities;

public sealed class UserWorkExperienceEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public SpecializationEntityEnum Specialization { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }

    public UserProfileEntity User { get; set; } = null!;
}