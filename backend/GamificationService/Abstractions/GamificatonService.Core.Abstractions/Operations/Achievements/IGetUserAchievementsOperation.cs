using GamificatonService.Core.Abstractions.Models.GetUserAchievements;
using GamificatonService.Core.Abstractions.Models.Shared;

namespace GamificatonService.Core.Abstractions.Operations.Achievements;

public interface IGetUserAchievementsOperation
{
    Task<Result<GetUserAchievementsResultModel>> GetAsync(
        GetUserAchievementsOperationModel model,
        CancellationToken ct);
}