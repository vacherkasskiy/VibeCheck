using AutoMapper;
using GamificatonService.Core.Abstractions.Models.GetLevel;
using GamificatonService.Core.Abstractions.Models.Shared;
using GamificatonService.Core.Abstractions.Observability;
using GamificatonService.Core.Abstractions.Operations.Levels;
using GamificatonService.PersistentStorage.Abstractions.Models.Levels.GetUserLevel;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;
using System.Diagnostics;

namespace GamificatonService.Core.Operations.Levels;

public sealed class GetUserLevelOperation(
    IMapper mapper,
    ILevelsQueryRepository queryRepository)
    : IGetUserLevelOperation
{
    public async Task<Result<GetLevelOperationResultModel>> GetAsync(Guid userId, CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var repoInput = mapper.Map<GetUserLevelRepositoryInputModel>(userId);
            var repoOutput = await queryRepository.GetUserLevelAsync(repoInput, ct);

            if (repoOutput is null)
            {
                status = "not_found";
                return Error.NotFound("user not found");
            }

            return mapper.Map<GetLevelOperationResultModel>(repoOutput);
        }
        catch
        {
            status = "exception";
            GamificationMetrics.RecordOperationError("get_user_level", "core", "exception");
            throw;
        }
        finally
        {
            GamificationMetrics.RecordOperationDuration(
                "get_user_level",
                "core",
                status,
                stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
