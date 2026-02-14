using GamificatonService.Core.Abstractions.Models.GetLevel;
using GamificatonService.Core.Abstractions.Models.Shared;

namespace GamificatonService.Core.Abstractions.Operations.Levels;

public interface IGetUserLevelOperation
{
    Task<Result<GetLevelOperationResultModel>> GetAsync(Guid userId, CancellationToken ct);
}