namespace ReviewService.PersistentStorage.Abstractions.Models.Companies;

public sealed record GetCompaniesRepositoryOutputModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyListItemRepositoryModel> Companies { get; init; }
}