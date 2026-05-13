using ReviewService.PersistentStorage.Abstractions.Models.Admin.Companies;

namespace ReviewService.PersistentStorage.Abstractions.Repositories.Admin.Companies;

public interface IAdminCompaniesQueryRepository
{
    Task<AdminCompaniesPageRepositoryModel> GetCompaniesAsync(
        GetAdminCompaniesRepositoryInputModel input,
        CancellationToken ct);

    Task<AdminCompanyRepositoryModel?> GetCompanyAsync(Guid companyId, CancellationToken ct);

    Task<CompanyRequestsPageRepositoryModel> GetCompanyRequestsAsync(
        GetCompanyRequestsRepositoryInputModel input,
        CancellationToken ct);

    Task<bool> CompanyExistsByNameAsync(
        string name,
        Guid? exceptCompanyId,
        CancellationToken ct);

    Task<bool> IconExistsAsync(Guid iconId, CancellationToken ct);

    Task<bool> CompanyHasReviewsAsync(Guid companyId, CancellationToken ct);
}
