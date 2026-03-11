namespace ReviewService.Gateway.DTOs.Companies.GetCompanies;

public sealed record GetCompaniesResponse
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyListItemDto> Companies { get; init; }
}

public sealed record CompanyListItemDto
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public required string IconUrl { get; init; }
    public required double Weight { get; init; }
    public required IReadOnlyList<CompanyFlagDto> TopFlags { get; init; }
}