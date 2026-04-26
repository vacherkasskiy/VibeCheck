using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles.Enums;

namespace ReviewService.PersistentStorage.Abstractions.Models.UserProfiles;

public sealed record UpsertUserProfileRepositoryModel
{
    public required Guid UserId { get; init; }
    public required long ProfileVersion { get; init; }
    public string? DisplayName { get; init; }
    public string? IconId { get; init; }
    public DateTime? Birthday { get; init; }
    public required SexRepositoryEnum Sex { get; init; }
    public required EducationLevelRepositoryEnum Education { get; init; }
    public required SpecializationRepositoryEnum Specialization { get; init; }
    public required IReadOnlyCollection<UpsertUserWorkExperienceRepositoryModel> WorkExperience { get; init; }
}
