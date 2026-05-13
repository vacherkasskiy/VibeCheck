namespace ReviewService.Admin.Api.DTOs.Companies;

public sealed record GetCompanyRequestsResponse
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyRequestDto> Requests { get; init; }
}

public sealed record CompanyRequestDto
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
