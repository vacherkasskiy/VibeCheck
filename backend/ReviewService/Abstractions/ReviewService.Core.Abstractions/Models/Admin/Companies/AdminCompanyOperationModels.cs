namespace ReviewService.Core.Abstractions.Models.Admin.Companies;

public sealed record GetAdminCompaniesOperationModel(
    string? Q,
    int Take,
    int PageNum);

public sealed record AdminCompaniesPageOperationModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<AdminCompanyOperationModel> Companies { get; init; }
}

public sealed record AdminCompanyOperationModel
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

public sealed record CreateAdminCompanyOperationModel
{
    public required string Name { get; init; }
    public string? Description { get; init; }
    public Guid? IconId { get; init; }
    public string? SiteUrl { get; init; }
    public string? LinkedinUrl { get; init; }
    public string? HrUrl { get; init; }
}

public sealed record UpdateAdminCompanyOperationModel
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public Guid? IconId { get; init; }
    public string? SiteUrl { get; init; }
    public string? LinkedinUrl { get; init; }
    public string? HrUrl { get; init; }
}
