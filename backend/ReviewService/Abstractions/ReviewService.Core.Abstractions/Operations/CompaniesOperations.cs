using ReviewService.Core.Abstractions.Models;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations;

// GET /companies
public interface IGetCompaniesOperation
{
    Task<Result<GetCompaniesResultModel>> GetAsync(GetCompaniesOperationModel model, CancellationToken ct);
}

// GET /companies/{companyId}
public interface IGetCompanyOperation
{
    Task<Result<GetCompanyResultModel>> GetAsync(Guid companyId, CancellationToken ct);
}

// GET /companies/{companyId}/flags
public interface IGetCompanyFlagsOperation
{
    Task<Result<GetCompanyFlagsResultModel>> GetAsync(GetCompanyFlagsOperationModel model, CancellationToken ct);
}

// POST /companies
public interface ICreateCompanyRequestOperation
{
    Task<Result<CreateCompanyRequestResultModel>> CreateAsync(CreateCompanyRequestOperationModel model, CancellationToken ct);
}