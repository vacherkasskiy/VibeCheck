using ReviewService.Core.Abstractions.Models.Admin.Companies;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Admin.Companies;

public interface IGetAdminCompaniesOperation
{
    Task<Result<AdminCompaniesPageOperationModel>> GetAsync(
        GetAdminCompaniesOperationModel model,
        CancellationToken ct);
}

public interface IGetAdminCompanyOperation
{
    Task<Result<AdminCompanyOperationModel>> GetAsync(
        Guid companyId,
        CancellationToken ct);
}

public interface ICreateAdminCompanyOperation
{
    Task<Result<AdminCompanyOperationModel>> CreateAsync(
        CreateAdminCompanyOperationModel model,
        CancellationToken ct);
}

public interface IUpdateAdminCompanyOperation
{
    Task<Result<AdminCompanyOperationModel>> UpdateAsync(
        UpdateAdminCompanyOperationModel model,
        CancellationToken ct);
}

public interface IDeleteAdminCompanyOperation
{
    Task<Result> DeleteAsync(Guid companyId, CancellationToken ct);
}
