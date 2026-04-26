namespace ReviewService.Core.Abstractions.Models.Companies.GetCompanies;

public sealed record GetCompaniesOperationResultModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyListItemOperationModel> Companies { get; init; }
}

public sealed record CompanyListItemOperationModel
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public required string IconUrl { get; set; }
    public required double Weight { get; init; }
    public required IReadOnlyList<CompanyFlagOperationModel> TopFlags { get; init; } // max 5
}