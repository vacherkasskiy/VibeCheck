using GamificatonService.PersistentStorage.Abstractions.Models.AchievementProgressUpdate;

namespace GamificatonService.PersistentStorage.Abstractions.Repositories.Command;

public interface IAchievementsCommandRepository
{
    Task<AchievementProgressUpdateRepositoryOutputModel> IncrementProgressAsync(
        AchievementProgressUpdateRepositoryInputModel input,
        CancellationToken ct);
}