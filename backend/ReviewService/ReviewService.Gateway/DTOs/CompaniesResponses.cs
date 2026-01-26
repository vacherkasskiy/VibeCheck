namespace ReviewService.Gateway.DTOs;

public sealed record CreateCompanyRequestResponse
{
    public required string RequestId { get; init; }
    public required string Status { get; init; } // "pending"
    public required DateTimeOffset CreatedAt { get; init; }
}

// -------------------------
// GET /companies/{companyId}/flags
// -------------------------

public sealed record GetCompanyFlagsResponse
{
    public required Guid CompanyId { get; init; }
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyFlagDto> Flags { get; init; }
}

// -------------------------
// GET /companies/{companyId}
// -------------------------

public sealed record GetCompanyResponse
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public required string Description { get; init; }
    public CompanyLinksDto? Links { get; init; }
    public required IReadOnlyList<CompanyFlagDto> TopFlags { get; init; } // max 20
}


public sealed record GetCompaniesResponse
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyListItemDto> Companies { get; init; }
}