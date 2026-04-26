using GamificatonService.PersistentStorage.Abstractions.Models.Levels;
using GamificatonService.PersistentStorage.Abstractions.Models.Levels.GetMyLevel;
using GamificatonService.PersistentStorage.Abstractions.Models.Levels.GetUserLevel;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;
using Microsoft.EntityFrameworkCore;

namespace GamificatonService.PersistentStorage.Repositories.Query;

public sealed class LevelsQueryRepository(AppDbContext dbContext) : ILevelsQueryRepository
{
    public async Task<GetLevelRepositoryOutputModel?> GetMyLevelAsync(
        GetMyLevelRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        if (input.UserId == Guid.Empty)
            return null;

        var userLevel = await dbContext.UserLevels
            .AsNoTracking()
            .Where(x => x.UserId == input.UserId)
            .Select(x => new { x.UserId, x.TotalXp, x.CurrentLevel })
            .SingleOrDefaultAsync(ct);

        if (userLevel is null)
            return await BuildFromXpAsync(totalXp: 0, currentLevelHint: 1, ct);

        return await BuildFromXpAsync(userLevel.TotalXp, userLevel.CurrentLevel, ct);
    }

    public async Task<GetLevelRepositoryOutputModel?> GetUserLevelAsync(
        GetUserLevelRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        if (input.UserId == Guid.Empty)
            return null;

        var userLevel = await dbContext.UserLevels
            .AsNoTracking()
            .Where(x => x.UserId == input.UserId)
            .Select(x => new { x.TotalXp, x.CurrentLevel })
            .SingleOrDefaultAsync(ct);

        if (userLevel is null)
            return null;

        return await BuildFromXpAsync(userLevel.TotalXp, userLevel.CurrentLevel, ct);
    }

    private async Task<GetLevelRepositoryOutputModel> BuildFromXpAsync(
        long totalXp,
        int currentLevelHint,
        CancellationToken ct)
    {
        // thresholds
        // current level threshold (fallback 0)
        var currentLevel = Math.Max(1, currentLevelHint);

        var currentFloor = await dbContext.LevelThresholds
            .AsNoTracking()
            .Where(x => x.Level == currentLevel)
            .Select(x => (long?)x.XpRequiredTotal)
            .SingleOrDefaultAsync(ct) ?? 0;

        // next level threshold (если не существует - значит max level)
        var nextFloor = await dbContext.LevelThresholds
            .AsNoTracking()
            .Where(x => x.Level == currentLevel + 1)
            .Select(x => (long?)x.XpRequiredTotal)
            .SingleOrDefaultAsync(ct);

        if (nextFloor is null)
        {
            // достигнут max level
            return new GetLevelRepositoryOutputModel
            {
                CurrentLevel = currentLevel,
                ProgressCurrent = 0,
                ProgressTarget = 0
            };
        }

        var progressCurrent = Math.Max(0, totalXp - currentFloor);
        var progressTarget = Math.Max(0, nextFloor.Value - currentFloor);

        // на всякий: если totalXp вышел за nextFloor (данные могли быть не синхронизированы)
        if (progressCurrent > progressTarget)
            progressCurrent = progressTarget;

        return new GetLevelRepositoryOutputModel
        {
            CurrentLevel = currentLevel,
            ProgressCurrent = (int)progressCurrent,
            ProgressTarget = (int)progressTarget
        };
    }
}