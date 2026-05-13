namespace ReviewService.PersistentStorage.Abstractions.Models.Admin.Reviews;

public sealed record GetAdminReviewReportsRepositoryInputModel
{
    public string? ReasonType { get; init; }
    public int Take { get; init; }
    public int PageNum { get; init; }
}

public sealed record AdminReviewReportsPageRepositoryModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<AdminReviewReportRepositoryModel> Reports { get; init; }
}

public sealed record AdminReviewReportRepositoryModel
{
    public required Guid ReportId { get; init; }
    public required Guid ReviewId { get; init; }
    public required Guid ReporterId { get; init; }
    public required string ReasonType { get; init; }
    public string? ReasonText { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
    public required Guid ReviewAuthorId { get; init; }
    public required Guid CompanyId { get; init; }
    public required string CompanyName { get; init; }
    public string? ReviewText { get; init; }
    public required DateTime ReviewCreatedAtUtc { get; init; }
    public DateTime? ReviewDeletedAtUtc { get; init; }
}
