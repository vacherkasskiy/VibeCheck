namespace ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompany;

public sealed record GetCompanyRepositoryInputModel
{
    public required Guid CompanyId { get; init; }
}