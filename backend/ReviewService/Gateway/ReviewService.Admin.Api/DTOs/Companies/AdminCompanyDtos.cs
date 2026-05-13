namespace ReviewService.Admin.Api.DTOs.Companies;

public sealed record GetCompaniesResponse
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<AdminCompanyDto> Companies { get; init; }
}

public sealed record AdminCompanyDto
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public Guid? IconId { get; init; }
    public string? SiteUrl { get; init; }
    public string? LinkedinUrl { get; init; }
    public string? HrUrl { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public required DateTimeOffset UpdatedAt { get; init; }
}

public sealed record CreateCompanyRequest
{
    public required string Name { get; init; }
    public string? Description { get; init; }
    public Guid? IconId { get; init; }
    public string? SiteUrl { get; init; }
    public string? LinkedinUrl { get; init; }
    public string? HrUrl { get; init; }
}

public sealed record UpdateCompanyRequest
{
    public required string Name { get; init; }
    public string? Description { get; init; }
    public Guid? IconId { get; init; }
    public string? SiteUrl { get; init; }
    public string? LinkedinUrl { get; init; }
    public string? HrUrl { get; init; }
}
