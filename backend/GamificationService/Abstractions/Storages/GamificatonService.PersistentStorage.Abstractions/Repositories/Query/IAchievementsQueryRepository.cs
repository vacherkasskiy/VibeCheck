using GamificatonService.PersistentStorage.Abstractions.Models.GetMyAchievements;
using GamificatonService.PersistentStorage.Abstractions.Models.GetUserCompletedAchievements;

namespace GamificatonService.PersistentStorage.Abstractions.Repositories.Query;

public interface IAchievementsQueryRepository
{
    Task<GetMyAchievementsRepositoryOutputModel?> GetMyAchievementsAsync(
        GetMyAchievementsRepositoryInputModel input,
        CancellationToken ct);

    Task<GetUserAchievementsRepositoryOutputModel?> GetUserCompletedAchievementsAsync(
        GetUserAchievementsRepositoryInputModel input,
        CancellationToken ct);
}