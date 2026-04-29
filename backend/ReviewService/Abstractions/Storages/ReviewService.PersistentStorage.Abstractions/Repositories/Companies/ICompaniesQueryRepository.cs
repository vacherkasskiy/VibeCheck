using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompany;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanyFlags;

namespace ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

public interface ICompaniesQueryRepository
{
    Task<bool> CompanyExistsByNameAsync(string name, CancellationToken ct);

    public Task<bool> PendingCompanyRequestExistsByNameAsync(string name, CancellationToken ct);
    
    Task<GetCompaniesRepositoryOutputModel?> GetCompaniesAsync(
        GetCompaniesRepositoryInputModel input,
        CancellationToken ct);

    Task<GetCompaniesRepositoryOutputModel?> GetCompaniesForWeightAsync(
        GetCompaniesRepositoryInputModel input,
        CancellationToken ct);

    Task<GetCompanyRepositoryOutputModel?> GetCompanyAsync(
        GetCompanyRepositoryInputModel input,
        CancellationToken ct);

    Task<GetCompanyFlagsRepositoryOutputModel?> GetCompanyFlagsAsync(
        GetCompanyFlagsRepositoryInputModel input,
        CancellationToken ct);
}
