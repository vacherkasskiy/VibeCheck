using GamificatonService.PersistentStorage.Abstractions.Models.AddXp;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Command;
using GamificatonService.PersistentStorage.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamificatonService.PersistentStorage.Repositories.Command;

internal sealed class LevelsCommandRepository(AppDbContext dbContext) : ILevelsCommandRepository
{
    public async Task<AddXpRepositoryOutputModel> AddXpAsync(
        AddXpRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        var userLevel = await dbContext.UserLevels
            .SingleOrDefaultAsync(x => x.UserId == input.UserId, ct);

        if (userLevel is null)
        {
            userLevel = new UserLevelEntity
            {
                UserId = input.UserId,
                TotalXp = 0,
                CurrentLevel = 1,
                UpdatedAt = input.UtcNow.DateTime
            };

            dbContext.UserLevels.Add(userLevel);
        }

        var previousLevel = userLevel.CurrentLevel;

        userLevel.TotalXp += input.XpDelta;
        userLevel.UpdatedAt = input.UtcNow.DateTime;

        var newLevel = await dbContext.LevelThresholds
            .AsNoTracking()
            .Where(x => x.XpRequiredTotal <= userLevel.TotalXp)
            .OrderByDescending(x => x.Level)
            .Select(x => x.Level)
            .FirstOrDefaultAsync(ct);

        if (newLevel <= 0)
            newLevel = 1;

        userLevel.CurrentLevel = newLevel;

        await dbContext.SaveChangesAsync(ct);

        return new AddXpRepositoryOutputModel
        {
            NewTotalXp = userLevel.TotalXp,
            PreviousLevel = previousLevel,
            NewLevel = newLevel
        };
    }
}