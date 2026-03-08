using ReviewService.PersistentStorage.Abstractions.Models.Companies.CreateCompany;

namespace ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

public interface ICompaniesCommandRepository
{
    Task<CreateCompanyRequestRepositoryOutputModel> CreateCompanyRequestAsync(
        CreateCompanyRequestRepositoryInputModel model,
        CancellationToken ct);
}