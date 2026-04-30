using GamificatonService.PersistentStorage.Abstractions.Models.AchievementProgressUpdate;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Command;
using GamificatonService.PersistentStorage.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamificatonService.PersistentStorage.Repositories.Command;

public sealed class AchievementsCommandRepository(AppDbContext dbContext) : IAchievementsCommandRepository
{
    public async Task<AchievementProgressUpdateRepositoryOutputModel> IncrementProgressAsync(
        AchievementProgressUpdateRepositoryInputModel input,
        CancellationToken ct)
    {
        var achievement = await dbContext.Achievements
            .SingleOrDefaultAsync(x => x.Id == input.AchievementId, ct)
            ?? throw new InvalidOperationException($"Achievement '{input.AchievementId}' was not found.");

        var entity = await dbContext.UserAchievements
            .SingleOrDefaultAsync(
                x => x.UserId == input.UserId && x.AchievementId == input.AchievementId,
                ct);

        var wasJustObtained = false;

        if (entity is null)
        {
            entity = new UserAchievementEntity
            {
                UserId = input.UserId,
                AchievementId = input.AchievementId,
                ProgressCurrent = input.Delta,
                CreatedAt = input.UtcNow.UtcDateTime,
                UpdatedAt = input.UtcNow.UtcDateTime,
                ObtainedAt = input.Delta >= input.TargetValue ? input.UtcNow.UtcDateTime : null
            };

            if (entity.ObtainedAt is not null)
                wasJustObtained = true;

            dbContext.UserAchievements.Add(entity);
        }
        else
        {
            if (entity.ObtainedAt is null)
            {
                entity.ProgressCurrent += input.Delta;
                entity.UpdatedAt = input.UtcNow.UtcDateTime;

                if (entity.ProgressCurrent >= input.TargetValue)
                {
                    entity.ObtainedAt = input.UtcNow.UtcDateTime;
                    wasJustObtained = true;
                }
            }
        }

        await dbContext.SaveChangesAsync(ct);

        return new AchievementProgressUpdateRepositoryOutputModel
        {
            UserId = entity.UserId,
            AchievementId = entity.AchievementId,
            AchievementName = achievement.Name,
            ProgressCurrent = entity.ProgressCurrent,
            WasJustObtained = wasJustObtained,
            ObtainedAt = entity.ObtainedAt is null
                ? null
                : new DateTimeOffset(DateTime.SpecifyKind(entity.ObtainedAt.Value,
                    DateTimeKind.Utc)),
            AchievementXpReward = achievement.XpReward
        };
    }
}
