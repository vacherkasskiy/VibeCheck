using ReviewService.Core.Abstractions.Enums;

namespace ReviewService.Core.Abstractions.Models.Users;

public sealed record ApplyUserProfileUpdatedOperationModel
{
    public required Guid UserId { get; init; }
    public required long ProfileVersion { get; init; }
    public string? DisplayName { get; init; }
    public string? IconId { get; init; }
    public DateTime? Birthday { get; init; }
    public required SexOperationEnum Sex { get; init; }
    public required EducationLevelOperationEnum Education { get; init; }
    public required SpecializationOperationEnum Specialization { get; init; }
    public required IReadOnlyCollection<UserWorkExperienceOperationModel> WorkExperience { get; init; }
}

public sealed record UserWorkExperienceOperationModel
{
    public required SpecializationOperationEnum Specialization { get; init; }
    public required DateTime StartedAt { get; init; }
    public DateTime? FinishedAt { get; init; }
}
