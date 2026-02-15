namespace ReviewService.Core.Abstractions.Models.Companies.GetCompanies;

public sealed record GetCompaniesOperationResultModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyListItemModel> Companies { get; init; }
}

public sealed record CompanyListItemModel
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public required double Weight { get; init; }
    public required IReadOnlyList<FlagCountModel> TopFlags { get; init; } // max 5
}