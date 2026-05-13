namespace ReviewService.Core.Abstractions.Models.Admin.Companies;

public sealed record GetCompanyRequestsOperationModel(
    string? Status,
    string? Q,
    int Take,
    int PageNum);

public sealed record CompanyRequestsPageOperationModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyRequestOperationModel> Requests { get; init; }
}

public sealed record CompanyRequestOperationModel
{
    public required Guid RequestId { get; init; }
    public required Guid RequesterUserId { get; init; }
    public required string Name { get; init; }
    public string? SiteUrl { get; init; }
    public required string Status { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? DecidedAt { get; init; }
    public Guid? DecidedByUserId { get; init; }
}
