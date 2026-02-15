using ReviewService.Core.Abstractions.Models;
using ReviewService.Core.Abstractions.Models.Companies.CreateCompany;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Companies;

public interface ICreateCompanyRequestOperation
{
    Task<Result<CreateCompanyOperationResultModel>> CreateAsync(
        CreateCompanyOperationRequestModel model,
        CancellationToken ct);
}