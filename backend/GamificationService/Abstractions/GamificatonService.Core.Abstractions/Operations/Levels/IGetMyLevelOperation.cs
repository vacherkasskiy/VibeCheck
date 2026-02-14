using GamificatonService.Core.Abstractions.Models.GetLevel;
using GamificatonService.Core.Abstractions.Models.Shared;

namespace GamificatonService.Core.Abstractions.Operations.Levels;

public interface IGetMyLevelOperation
{
    Task<Result<GetLevelOperationResultModel>> GetAsync(CancellationToken ct);
}