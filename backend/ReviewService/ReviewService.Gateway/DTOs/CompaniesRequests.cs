namespace ReviewService.Gateway.DTOs;

// -------------------------
// GET /companies
// -------------------------

public sealed record CompanyListItemDto
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public required double Weight { get; init; }
    public required IReadOnlyList<CompanyFlagDto> TopFlags { get; init; }
}

public sealed record CompanyLinksDto
{
    public string? Site { get; init; }
    public string? Linkedin { get; init; }
    public string? Hh { get; init; }
}

// -------------------------
// POST /companies (заявка)
// -------------------------

public sealed record CreateCompanyRequest
{
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public string? Site { get; init; }
}