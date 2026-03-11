namespace ReviewService.PersistentStorage.Entites;

public enum EducationLevelEntityEnum
{
    Unknown = 0,
    Secondary = 1,
    Vocational = 2,
    Bachelor = 3,
    Master = 4,
    Phd = 5
}

public enum SpecializationEntityEnum
{
    Unknown = 0,
    Backend = 1,
    Frontend = 2,
    Fullstack = 3,
    Mobile = 4,
    Data = 5,
    DevOps = 6,
    QA = 7,
    PM = 8,
    Design = 9
}

public sealed class FlagEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public ICollection<CompanyFlagEntity> CompanyFlags { get; set; } = new List<CompanyFlagEntity>();
    public ICollection<ReviewFlagEntity> ReviewFlags { get; set; } = new List<ReviewFlagEntity>();
}

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

public sealed class CompanyEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public Guid? IconId { get; set; }
    public string? SiteUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? HrUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public IconEntity? Icon { get; set; }

    public ICollection<CompanyFlagEntity> CompanyFlags { get; set; } = new List<CompanyFlagEntity>();
    public ICollection<ReviewEntity> Reviews { get; set; } = new List<ReviewEntity>();
}

public sealed class CompanyRequestEntity
{
    public Guid Id { get; set; }
    public Guid RequesterUserId { get; set; }
    public string Name { get; set; } = null!;
    public string? SiteUrl { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? DecidedAt { get; set; }
    public Guid? DecidedByUserId { get; set; }
}

public sealed class UserProfileEntity
{
    public Guid UserId { get; set; }
    public string? IconId { get; set; }
    public string? DisplayName { get; set; }
    public DateTime UpdatedAt { get; set; }

    public DateTime? Birthday { get; set; }

    // enums храним строками (через EF HasConversion<string>())
    public EducationLevelEntityEnum Education { get; set; }
    public SpecializationEntityEnum Specialization { get; set; }

    public ICollection<UserWorkExperienceEntity> WorkExperience { get; set; } = new List<UserWorkExperienceEntity>();

    public ICollection<ReviewEntity> AuthoredReviews { get; set; } = new List<ReviewEntity>();
    public ICollection<ReviewVoteEntity> ReviewVotes { get; set; } = new List<ReviewVoteEntity>();
    public ICollection<ReviewReportEntity> ReviewReports { get; set; } = new List<ReviewReportEntity>();
}

public sealed class UserWorkExperienceEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public SpecializationEntityEnum Specialization { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }

    public UserProfileEntity User { get; set; } = null!;
}

public sealed class ReviewEntity
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public Guid AuthorId { get; set; }
    public string? Text { get; set; }
    public long LikesCount { get; set; }
    public long DislikesCount { get; set; }
    public long Score { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }

    public CompanyEntity Company { get; set; } = null!;
    public UserProfileEntity Author { get; set; } = null!;

    public ICollection<ReviewFlagEntity> ReviewFlags { get; set; } = new List<ReviewFlagEntity>();
    public ICollection<ReviewVoteEntity> ReviewVotes { get; set; } = new List<ReviewVoteEntity>();
    public ICollection<ReviewReportEntity> ReviewReports { get; set; } = new List<ReviewReportEntity>();
}

public sealed class CompanyFlagEntity
{
    public Guid CompanyId { get; set; }
    public Guid FlagId { get; set; }
    public long ReviewsCount { get; set; }
    public DateTime UpdatedAt { get; set; }

    public CompanyEntity Company { get; set; } = null!;
    public FlagEntity Flag { get; set; } = null!;
}

public sealed class ReviewFlagEntity
{
    public Guid ReviewId { get; set; }
    public Guid FlagId { get; set; }
    public DateTime CreatedAt { get; set; }

    public ReviewEntity Review { get; set; } = null!;
    public FlagEntity Flag { get; set; } = null!;
}

public sealed class ReviewVoteEntity
{
    public Guid ReviewId { get; set; }
    public Guid VoterId { get; set; }
    public string Mode { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ReviewEntity Review { get; set; } = null!;
    public UserProfileEntity Voter { get; set; } = null!;
}

public sealed class ReviewReportEntity
{
    public Guid Id { get; set; }
    public Guid ReviewId { get; set; }
    public Guid ReporterId { get; set; }
    public string ReasonType { get; set; } = null!;
    public string? ReasonText { get; set; }
    public DateTime CreatedAt { get; set; }

    public ReviewEntity Review { get; set; } = null!;
    public UserProfileEntity Reporter { get; set; } = null!;
}