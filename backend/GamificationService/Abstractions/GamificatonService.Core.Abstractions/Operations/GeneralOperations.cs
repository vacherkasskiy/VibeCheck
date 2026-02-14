using GamificatonService.Core.Abstractions.Models;
using GamificatonService.Core.Abstractions.Models.Shared;

namespace GamificatonService.Core.Abstractions.Operations;

// achievements
public interface IGetMyAchievementsOperation
{
    Task<Result<GetMyAchievementsResultModel>> GetAsync(GetMyAchievementsOperationModel model, CancellationToken ct);
}

public interface IGetUserAchievementsOperation
{
    Task<Result<GetUserAchievementsResultModel>> GetAsync(GetUserAchievementsOperationModel model, CancellationToken ct);
}

// levels
public interface IGetMyLevelOperation
{
    Task<Result<GetLevelResultModel>> GetAsync(CancellationToken ct);
}

public interface IGetUserLevelOperation
{
    Task<Result<GetLevelResultModel>> GetAsync(Guid userId, CancellationToken ct);
}