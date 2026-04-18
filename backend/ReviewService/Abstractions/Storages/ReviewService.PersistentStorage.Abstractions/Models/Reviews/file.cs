namespace ReviewService.PersistentStorage.Abstractions.Models.Reviews;

public sealed record CreateReviewCommandRepositoryModel
{
    public required Guid ReviewId { get; init; }
    public required Guid CompanyId { get; init; }
    public required Guid AuthorId { get; init; }
    public string? Text { get; init; }
    public required IReadOnlyCollection<Guid> FlagIds { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
}

public sealed record ReviewOwnershipRepositoryModel
{
    public required Guid ReviewId { get; init; }
    public required Guid AuthorId { get; init; }
    public required bool IsDeleted { get; init; }
}

public sealed record ReviewOwnershipWithCompanyInfoRepositoryModel
{
    public required Guid ReviewId { get; init; }
    public required Guid AuthorId { get; init; }
    public required Guid CompanyId { get; init; }
    public required string CompanyName { get; init; }
    public required bool IsDeleted { get; init; }
}

public sealed record ReviewEditInfoRepositoryModel
{
    public required Guid ReviewId { get; init; }
    public required Guid AuthorId { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
    public required bool IsDeleted { get; init; }
}

public sealed record UpsertReviewVoteCommandRepositoryModel
{
    public required Guid ReviewId { get; init; }
    public required Guid VoterId { get; init; }
    public required string Mode { get; init; }
    public required DateTime UtcNow { get; init; }
}

public sealed record CreateReviewReportCommandRepositoryModel
{
    public required Guid ReportId { get; init; }
    public required Guid ReviewId { get; init; }
    public required Guid ReporterId { get; init; }
    public required string ReasonType { get; init; }
    public string? ReasonText { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
}