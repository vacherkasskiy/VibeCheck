using GamificatonService.Core.Abstractions.Models.GetMyAchievements;
using GamificatonService.Core.Abstractions.Models.Shared;

namespace GamificatonService.Core.Abstractions.Operations.Achievements;

public interface IGetMyAchievementsOperation
{
    Task<Result<GetMyAchievementsResultModel>> GetAsync(
        GetMyAchievementsOperationModel model,
        CancellationToken ct);
}