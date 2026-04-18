using AutoMapper;
using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Flags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Flags;
using System.Diagnostics;

namespace ReviewService.Core.Operations.Flags;

internal sealed class GetAllFlagsOperation(
    IMapper mapper,
    IFlagsQueryRepository queryRepository)
    : IGetAllFlagsOperation
{
    public async Task<Result<GetAllFlagsOperationResultModel>> GetAsync(CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var repoOutput = await queryRepository.GetAllAsync(ct);

            if (repoOutput is null)
            {
                status = "failure";
                ReviewMetrics.RecordOperationError("get_all_flags", "core", "repository_null");
                return Error.Failure("failed to load flags");
            }

            return mapper.Map<GetAllFlagsOperationResultModel>(repoOutput);
        }
        catch
        {
            status = "exception";
            ReviewMetrics.RecordOperationError("get_all_flags", "core", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("get_all_flags", "core", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
