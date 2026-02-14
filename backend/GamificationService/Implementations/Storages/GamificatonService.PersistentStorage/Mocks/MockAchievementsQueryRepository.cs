using GamificatonService.PersistentStorage.Abstractions.Enums;
using GamificatonService.PersistentStorage.Abstractions.Models.GetMyAchievements;
using GamificatonService.PersistentStorage.Abstractions.Models.GetUserCompletedAchievements;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;

namespace GamificatonService.PersistentStorage.Mocks;

/// <summary>
/// мок-репозиторий достижений: отдаёт хардкод.
/// </summary>
internal sealed class MockAchievementsQueryRepository : IAchievementsQueryRepository
{
    public Task<GetMyAchievementsRepositoryOutputModel?> GetMyAchievementsAsync(
        GetMyAchievementsRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        // простая пагинация по take/pageNum
        var all = new List<MyAchievementRepositoryItemOutputModel>
        {
            new()
            {
                AchievementId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Name = "first blood",
                Description = "оставь первый отзыв",
                IconId = "ach_first_review",
                Status = AchievementStatusRepositoryEnum.Completed,
                ProgressCurrent = 1,
                ProgressTarget = 1,
                ObtainedAt = DateTimeOffset.Parse("2026-02-01T10:15:00+00:00")
            },
            new()
            {
                AchievementId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Name = "on fire",
                Description = "оставь 10 отзывов",
                IconId = "ach_10_reviews",
                Status = AchievementStatusRepositoryEnum.InProgress,
                ProgressCurrent = 4,
                ProgressTarget = 10,
                ObtainedAt = null
            },
            new()
            {
                AchievementId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Name = "silent reader",
                Description = "прочитай 50 отзывов",
                IconId = "ach_read_50",
                Status = AchievementStatusRepositoryEnum.NotStarted,
                ProgressCurrent = 0,
                ProgressTarget = 50,
                ObtainedAt = null
            }
        };

        // фильтр status: 0=all, 1=completed, 2=uncompleted
        IEnumerable<MyAchievementRepositoryItemOutputModel> filtered = input.Status switch
        {
            MyAchievementsFilterStatusRepositoryEnum.Completed => all.Where(x => x.Status == 0),
            MyAchievementsFilterStatusRepositoryEnum.Uncompleted => all.Where(x => x.Status != 0),
            _ => all
        };

        var totalCount = filtered.LongCount();

        var take = Clamp(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var page = filtered
            .Skip(skip)
            .Take(take)
            .ToList();

        GetMyAchievementsRepositoryOutputModel output = new()
        {
            TotalCount = totalCount,
            Achievements = page
        };

        return Task.FromResult<GetMyAchievementsRepositoryOutputModel?>(output);
    }

    public Task<GetUserAchievementsRepositoryOutputModel?> GetUserCompletedAchievementsAsync(
        GetUserAchievementsRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        // примитивная логика "юзер не найден"
        if (input.UserId == Guid.Empty)
            return Task.FromResult<GetUserAchievementsRepositoryOutputModel?>(null);

        var allCompleted = new List<UserAchievementItemRepositoryOutputModel>
        {
            new()
            {
                AchievementId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                Name = "reviewer",
                IconId = "ach_reviewer",
                ObtainedAt = DateTimeOffset.Parse("2026-01-10T09:00:00+00:00")
            },
            new()
            {
                AchievementId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                Name = "popular",
                IconId = "ach_popular",
                ObtainedAt = DateTimeOffset.Parse("2026-02-05T18:30:00+00:00")
            }
        };

        var take = ClampLong(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var page = allCompleted
            .Skip((int)skip)
            .Take((int)take)
            .ToList();

        GetUserAchievementsRepositoryOutputModel output = new()
        {
            TotalCount = allCompleted.LongCount(),
            Achievements = page
        };

        return Task.FromResult<GetUserAchievementsRepositoryOutputModel?>(output);
    }

    private static int Clamp(int value, int min, int max) => value < min ? min : value > max ? max : value;

    private static long ClampLong(long value, long min, long max) => value < min ? min : value > max ? max : value;
}