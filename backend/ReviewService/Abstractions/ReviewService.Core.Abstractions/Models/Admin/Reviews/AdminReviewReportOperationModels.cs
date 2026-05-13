namespace ReviewService.Core.Abstractions.Models.Admin.Reviews;

public sealed record GetAdminReviewReportsOperationModel(
    string? ReasonType,
    int Take,
    int PageNum);

public sealed record AdminReviewReportsPageOperationModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<AdminReviewReportOperationModel> Reports { get; init; }
}

public sealed record AdminReviewReportOperationModel
{
    public required Guid ReportId { get; init; }
    public required Guid ReviewId { get; init; }
    public required Guid ReporterId { get; init; }
    public required string ReasonType { get; init; }
    public string? ReasonText { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public required Guid ReviewAuthorId { get; init; }
    public required Guid CompanyId { get; init; }
    public required string CompanyName { get; init; }
    public string? ReviewText { get; init; }
    public required DateTimeOffset ReviewCreatedAt { get; init; }
    public DateTimeOffset? ReviewDeletedAt { get; init; }
}
