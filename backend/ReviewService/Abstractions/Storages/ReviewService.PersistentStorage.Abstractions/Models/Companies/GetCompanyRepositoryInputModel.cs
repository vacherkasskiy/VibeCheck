namespace ReviewService.PersistentStorage.Abstractions.Models.Companies;

/// <summary>
/// input для GET /companies/{companyId}.
/// </summary>
public sealed record GetCompanyRepositoryInputModel
{
    public required Guid CompanyId { get; init; }
}