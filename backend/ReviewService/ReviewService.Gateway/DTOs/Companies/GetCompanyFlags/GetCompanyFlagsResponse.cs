namespace ReviewService.Gateway.DTOs.Companies.GetCompanyFlags;

public sealed record GetCompanyFlagsResponse
{
    public required Guid CompanyId { get; init; }
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyFlagDto> Flags { get; init; }
}