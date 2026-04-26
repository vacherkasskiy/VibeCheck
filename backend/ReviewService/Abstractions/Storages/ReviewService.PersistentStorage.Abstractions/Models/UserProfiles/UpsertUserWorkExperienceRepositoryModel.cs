using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles.Enums;

namespace ReviewService.PersistentStorage.Abstractions.Models.UserProfiles;

public sealed record UpsertUserWorkExperienceRepositoryModel
{
    public required SpecializationRepositoryEnum Specialization { get; init; }
    public required DateTime StartedAt { get; init; }
    public DateTime? FinishedAt { get; init; }
}
