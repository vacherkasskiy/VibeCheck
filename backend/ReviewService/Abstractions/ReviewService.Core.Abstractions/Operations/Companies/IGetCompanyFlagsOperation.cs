using ReviewService.Core.Abstractions.Models;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Companies;

public interface IGetCompanyFlagsOperation
{
    Task<Result<GetCompanyFlagsResultModel>> GetAsync(GetCompanyFlagsOperationModel model, CancellationToken ct);
}