using ReviewService.PersistentStorage.Abstractions.Models.Shared;

namespace ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanies;

public sealed record GetCompaniesRepositoryOutputModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyListItemRepositoryModel> Companies { get; init; }
}

public sealed record CompanyListItemRepositoryModel
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public required IReadOnlyList<FlagCountRepositoryModel> TopFlags { get; init; } // максимум 5
}