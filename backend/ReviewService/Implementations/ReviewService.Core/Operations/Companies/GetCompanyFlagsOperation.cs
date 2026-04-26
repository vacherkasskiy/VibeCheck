using AutoMapper;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;
using System.Diagnostics;

namespace ReviewService.Core.Operations.Companies;

internal sealed class GetCompanyFlagsOperation(
    IMapper mapper,
    ICompaniesQueryRepository queryRepository)
    : IGetCompanyFlagsOperation
{
    public async Task<Result<GetCompanyFlagsOperationResultModel>> GetAsync(
        GetCompanyFlagsOperationModel model,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var repoInput = mapper.Map<GetCompanyFlagsRepositoryInputModel>(model);
            var repoOutput = await queryRepository.GetCompanyFlagsAsync(repoInput, ct);

            if (repoOutput is null)
            {
                status = "not_found";
                return Error.NotFound("company not found");
            }

            return mapper.Map<GetCompanyFlagsOperationResultModel>(repoOutput);
        }
        catch
        {
            status = "exception";
            ReviewMetrics.RecordOperationError("get_company_flags", "core", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("get_company_flags", "core", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
