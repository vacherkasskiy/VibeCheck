namespace ReviewService.PersistentStorage.Abstractions.Models.Admin.Companies;

public sealed record GetAdminCompaniesRepositoryInputModel
{
    public string? Q { get; init; }
    public int Take { get; init; }
    public int PageNum { get; init; }
}

public sealed record AdminCompaniesPageRepositoryModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<AdminCompanyRepositoryModel> Companies { get; init; }
}

public sealed record AdminCompanyRepositoryModel
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public Guid? IconId { get; init; }
    public string? SiteUrl { get; init; }
    public string? LinkedinUrl { get; init; }
    public string? HrUrl { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
    public required DateTime UpdatedAtUtc { get; init; }
}

public sealed record UpsertAdminCompanyRepositoryModel
{
    public required string Name { get; init; }
    public string? Description { get; init; }
    public Guid? IconId { get; init; }
    public string? SiteUrl { get; init; }
    public string? LinkedinUrl { get; init; }
    public string? HrUrl { get; init; }
}
