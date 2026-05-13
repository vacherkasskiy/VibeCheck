namespace ReviewService.PersistentStorage.Abstractions.Models.Admin.Companies;

public sealed record GetCompanyRequestsRepositoryInputModel
{
    public string? Status { get; init; }
    public string? Q { get; init; }
    public int Take { get; init; }
    public int PageNum { get; init; }
}

public sealed record CompanyRequestsPageRepositoryModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyRequestRepositoryModel> Requests { get; init; }
}

public sealed record CompanyRequestRepositoryModel
{
    public required Guid RequestId { get; init; }
    public required Guid RequesterUserId { get; init; }
    public required string Name { get; init; }
    public string? SiteUrl { get; init; }
    public required string Status { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
    public DateTime? DecidedAtUtc { get; init; }
    public Guid? DecidedByUserId { get; init; }
}
