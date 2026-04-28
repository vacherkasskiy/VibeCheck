using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles.Enums;

namespace ReviewService.PersistentStorage.Abstractions.Models.UserProfiles;

public sealed record UserProfileForSimilarityRepositoryModel
{
    public required Guid UserId { get; init; }
    public required string? IconId { get; init; }
    public required DateTime? Birthday { get; init; }
    public required EducationLevelRepositoryEnum Education { get; init; }
    public required SpecializationRepositoryEnum Specialization { get; init; }
    public required IReadOnlyList<UserWorkExperienceForSimilarityRepositoryModel> WorkExperience { get; init; }
    public required IReadOnlyList<UserProfileFlagForSimilarityRepositoryModel> Flags { get; init; }
}

public sealed record UserWorkExperienceForSimilarityRepositoryModel
{
    public required SpecializationRepositoryEnum Specialization { get; init; }
    public required DateTime StartedAt { get; init; }
    public required DateTime? FinishedAt { get; init; }
}

public sealed record UserProfileFlagForSimilarityRepositoryModel
{
    public required Guid FlagId { get; init; }
    public required UserProfileFlagColorRepositoryEnum Color { get; init; }
    public required int Weight { get; init; }
}
