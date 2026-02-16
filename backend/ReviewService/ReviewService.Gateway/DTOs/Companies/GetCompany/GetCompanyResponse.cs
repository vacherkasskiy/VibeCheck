namespace ReviewService.Gateway.DTOs.Companies.GetCompany;

public sealed record GetCompanyResponse
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public required string Description { get; init; }
    public CompanyLinksDto? Links { get; init; }
    public required IReadOnlyList<CompanyFlagDto> TopFlags { get; init; } // max 20
}

public sealed record CompanyLinksDto
{
    public string? Site { get; init; }
    public string? Linkedin { get; init; }
    public string? Hh { get; init; }
}