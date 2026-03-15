using GamificatonService.PersistentStorage.Abstractions.Enums;
using GamificatonService.PersistentStorage.Abstractions.Models.GetMyAchievements;
using GamificatonService.PersistentStorage.Abstractions.Models.GetUserCompletedAchievements;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;
using Microsoft.EntityFrameworkCore;

namespace GamificatonService.PersistentStorage.Repositories;

public sealed class AchievementsQueryRepository(AppDbContext dbContext) : IAchievementsQueryRepository
{
    public async Task<GetMyAchievementsRepositoryOutputModel?> GetMyAchievementsAsync(
        GetMyAchievementsRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        if (input.UserId == Guid.Empty)
            return null;

        var take = Clamp(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        // achievements + left join user_achievements (по userId)
        var baseQuery = dbContext.Achievements
            .AsNoTracking()
            .Where(a => a.IsActive)
            .GroupJoin(
                dbContext.UserAchievements.AsNoTracking().Where(ua => ua.UserId == input.UserId),
                a => a.Id,
                ua => ua.AchievementId,
                (a, uas) => new { a, uas })
            .SelectMany(
                x => x.uas.DefaultIfEmpty(),
                (x, ua) => new
                {
                    x.a.Id,
                    x.a.Name,
                    x.a.Description,
                    x.a.IconId,
                    x.a.TargetValue,
                    ProgressCurrent = ua != null ? ua.ProgressCurrent : 0L,
                    ObtainedAt = ua != null ? ua.ObtainedAt : null
                });

        var withStatus = baseQuery.Select(x => new
        {
            x.Id,
            x.Name,
            x.Description,
            x.IconId,
            x.TargetValue,
            x.ProgressCurrent,
            x.ObtainedAt,
            Status =
                x.ObtainedAt != null ? AchievementStatusRepositoryEnum.Completed :
                x.ProgressCurrent > 0 ? AchievementStatusRepositoryEnum.InProgress :
                AchievementStatusRepositoryEnum.NotStarted
        });

        var filtered = input.Status switch
        {
            MyAchievementsFilterStatusRepositoryEnum.Completed =>
                withStatus.Where(x => x.Status == AchievementStatusRepositoryEnum.Completed),

            MyAchievementsFilterStatusRepositoryEnum.Uncompleted =>
                withStatus.Where(x => x.Status != AchievementStatusRepositoryEnum.Completed),

            _ => withStatus
        };

        var totalCount = await filtered.LongCountAsync(ct);

        // сортировка “recent”: obtainedAt desc, затем progress desc
        var page = await filtered
            .OrderByDescending(x => x.ObtainedAt.HasValue)
            .ThenByDescending(x => x.ObtainedAt)
            .ThenByDescending(x => x.ProgressCurrent)
            .ThenBy(x => x.Name)
            .Skip(skip)
            .Take(take)
            .Select(x => new MyAchievementRepositoryItemOutputModel
            {
                AchievementId = x.Id,
                Name = x.Name,
                Description = x.Description,
                IconId = x.IconId,
                Status = x.Status,
                ProgressCurrent = x.ProgressCurrent,
                ProgressTarget = x.TargetValue,
                ObtainedAt = x.ObtainedAt
            })
            .ToListAsync(ct);

        return new GetMyAchievementsRepositoryOutputModel
        {
            TotalCount = totalCount,
            Achievements = page
        };
    }

    public async Task<GetUserAchievementsRepositoryOutputModel?> GetUserCompletedAchievementsAsync(
        GetUserAchievementsRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        if (input.UserId == Guid.Empty)
            return null;

        var take = (int)ClampLong(input.Take, 1, 100);
        var pageNum = Math.Max(1, (int)input.PageNum);
        var skip = (pageNum - 1) * take;

        // "user not found" (внутренний критерий, т.к. users таблицы нет):
        // нет ни user_levels, ни user_achievements => считаем, что userId не существует
        var exists =
            await dbContext.UserLevels.AsNoTracking().AnyAsync(x => x.UserId == input.UserId, ct)
            || await dbContext.UserAchievements.AsNoTracking().AnyAsync(x => x.UserId == input.UserId, ct);

        if (!exists)
            return null;

        var query = dbContext.UserAchievements
            .AsNoTracking()
            .Where(ua => ua.UserId == input.UserId && ua.ObtainedAt != null)
            .Join(
                dbContext.Achievements.AsNoTracking(),
                ua => ua.AchievementId,
                a => a.Id,
                (ua, a) => new
                {
                    a.Id,
                    a.Name,
                    a.IconId,
                    ObtainedAt = ua.ObtainedAt!.Value
                });

        var totalCount = await query.LongCountAsync(ct);

        var page = await query
            .OrderByDescending(x => x.ObtainedAt)
            .Skip(skip)
            .Take(take)
            .Select(x => new UserAchievementItemRepositoryOutputModel
            {
                AchievementId = x.Id,
                Name = x.Name,
                IconId = x.IconId,
                ObtainedAt = x.ObtainedAt
            })
            .ToListAsync(ct);

        return new GetUserAchievementsRepositoryOutputModel
        {
            TotalCount = totalCount,
            Achievements = page
        };
    }

    private static int Clamp(int value, int min, int max) => value < min ? min : value > max ? max : value;
    private static long ClampLong(long value, long min, long max) => value < min ? min : value > max ? max : value;
}