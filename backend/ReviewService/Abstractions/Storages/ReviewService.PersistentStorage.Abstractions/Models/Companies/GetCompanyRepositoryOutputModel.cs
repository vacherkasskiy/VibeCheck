namespace ReviewService.PersistentStorage.Abstractions.Models.Companies;

public sealed record GetCompanyRepositoryOutputModel
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public required string Description { get; init; }
    public CompanyLinksRepositoryModel? Links { get; init; }
    public required IReadOnlyList<FlagCountRepositoryModel> TopFlags { get; init; } // максимум 20
}