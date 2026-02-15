using ReviewService.Core.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Companies;

public interface IGetCompanyFlagsOperation
{
    Task<Result<GetCompanyFlagsOperationResultModel>> GetAsync(GetCompanyFlagsOperationModel model, CancellationToken ct);
}