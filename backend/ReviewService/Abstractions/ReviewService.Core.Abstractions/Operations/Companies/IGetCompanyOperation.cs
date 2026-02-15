using ReviewService.Core.Abstractions.Models;
using ReviewService.Core.Abstractions.Models.Companies.GetCompany;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Companies;

public interface IGetCompanyOperation
{
    Task<Result<GetCompanyOperationResultModel>> GetAsync(Guid companyId, CancellationToken ct);
}