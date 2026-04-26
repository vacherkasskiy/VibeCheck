using ReviewService.PersistentStorage.Entities.Enums;

namespace ReviewService.PersistentStorage.Entities;

public sealed class UserProfileEntity
{
    public Guid UserId { get; set; }
    public long ProfileVersion { get; set; }
    public string? IconId { get; set; }
    public string? DisplayName { get; set; }
    public DateTime UpdatedAt { get; set; }

    public DateTime? Birthday { get; set; }
    public SexEntityEnum Sex { get; set; }

    // enums храним строками (через EF HasConversion<string>())
    public EducationLevelEntityEnum Education { get; set; }
    public SpecializationEntityEnum Specialization { get; set; }

    public ICollection<UserWorkExperienceEntity> WorkExperience { get; set; } = new List<UserWorkExperienceEntity>();

    public ICollection<UserProfileFlagEntity> UserFlags { get; set; } = new List<UserProfileFlagEntity>();

    public ICollection<ReviewEntity> AuthoredReviews { get; set; } = new List<ReviewEntity>();
    public ICollection<ReviewVoteEntity> ReviewVotes { get; set; } = new List<ReviewVoteEntity>();
    public ICollection<ReviewReportEntity> ReviewReports { get; set; } = new List<ReviewReportEntity>();
}
