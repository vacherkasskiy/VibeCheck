using ReviewService.Core.Abstractions.Models.Admin.Companies;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Admin.Companies;

public interface IGetCompanyRequestsOperation
{
    Task<Result<CompanyRequestsPageOperationModel>> GetAsync(
        GetCompanyRequestsOperationModel model,
        CancellationToken ct);
}
