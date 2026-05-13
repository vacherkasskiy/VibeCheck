using ReviewService.PersistentStorage.Abstractions.Models.Admin.Companies;

namespace ReviewService.PersistentStorage.Abstractions.Repositories.Admin.Companies;

public interface IAdminCompaniesCommandRepository
{
    Task<AdminCompanyRepositoryModel> CreateAsync(
        UpsertAdminCompanyRepositoryModel model,
        DateTime utcNow,
        CancellationToken ct);

    Task<AdminCompanyRepositoryModel?> UpdateAsync(
        Guid companyId,
        UpsertAdminCompanyRepositoryModel model,
        DateTime utcNow,
        CancellationToken ct);

    Task DeleteAsync(Guid companyId, CancellationToken ct);
}
