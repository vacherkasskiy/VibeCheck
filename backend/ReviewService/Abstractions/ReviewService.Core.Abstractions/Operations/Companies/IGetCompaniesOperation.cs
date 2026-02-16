using ReviewService.Core.Abstractions.Models.Companies.GetCompanies;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Companies;

public interface IGetCompaniesOperation
{
    Task<Result<GetCompaniesOperationResultModel>> GetAsync(GetCompaniesOperationModel model, CancellationToken ct);
}