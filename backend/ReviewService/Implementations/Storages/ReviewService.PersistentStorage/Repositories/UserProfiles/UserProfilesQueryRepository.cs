using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles;
using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles.Enums;
using ReviewService.PersistentStorage.Abstractions.Repositories.UserProfiles;

namespace ReviewService.PersistentStorage.Repositories.UserProfiles;

public sealed class UserProfilesQueryRepository(AppDbContext dbContext) : IUserProfilesQueryRepository
{
    public async Task<string?> GetIconIdByUserIdAsync(Guid userId, CancellationToken ct)
    {
        return await dbContext.UserProfiles
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .Select(x => x.IconId)
            .SingleOrDefaultAsync(ct); // null если не найден
    }
    
    public async Task<IReadOnlyDictionary<Guid, string?>> GetIconIdsByUserIdsAsync(
        IReadOnlyCollection<Guid> userIds,
        CancellationToken ct)
    {
        if (userIds is null)
            throw new ArgumentNullException(nameof(userIds));

        if (userIds.Count == 0)
            return new Dictionary<Guid, string?>();

        // если сюда передали огромный список, лучше порезать, чтобы не упереться в лимит параметров.
        // 500-1000 обычно ок для postgres.
        const int batchSize = 500;

        var result = new Dictionary<Guid, string?>(capacity: userIds.Count);

        foreach (var batch in Batch(userIds, batchSize))
        {
            var rows = await dbContext.UserProfiles
                .AsNoTracking()
                .Where(x => batch.Contains(x.UserId))
                .Select(x => new { x.UserId, x.IconId })
                .ToListAsync(ct);

            foreach (var row in rows)
                result[row.UserId] = row.IconId;
        }

        return result;
    }

    public async Task<IReadOnlyDictionary<Guid, UserProfileForSimilarityRepositoryModel>> GetProfilesForSimilarityByUserIdsAsync(
        IReadOnlyCollection<Guid> userIds,
        CancellationToken ct)
    {
        if (userIds is null)
            throw new ArgumentNullException(nameof(userIds));

        if (userIds.Count == 0)
            return new Dictionary<Guid, UserProfileForSimilarityRepositoryModel>();

        const int batchSize = 500;
        var result = new Dictionary<Guid, UserProfileForSimilarityRepositoryModel>(capacity: userIds.Count);

        foreach (var batch in Batch(userIds, batchSize))
        {
            var rows = await dbContext.UserProfiles
                .AsNoTracking()
                .AsSplitQuery()
                .Where(x => batch.Contains(x.UserId))
                .Select(x => new
                {
                    x.UserId,
                    x.IconId,
                    x.Birthday,
                    x.Education,
                    x.Specialization,
                    WorkExperience = x.WorkExperience
                        .Select(w => new
                        {
                            w.Specialization,
                            w.StartedAt,
                            w.FinishedAt
                        })
                        .ToList(),
                    Flags = x.UserFlags
                        .Select(f => new
                        {
                            f.FlagId,
                            f.Color,
                            f.Weight
                        })
                        .ToList()
                })
                .ToListAsync(ct);

            foreach (var row in rows)
            {
                result[row.UserId] = new UserProfileForSimilarityRepositoryModel
                {
                    UserId = row.UserId,
                    IconId = row.IconId,
                    Birthday = row.Birthday,
                    Education = (EducationLevelRepositoryEnum)row.Education,
                    Specialization = (SpecializationRepositoryEnum)row.Specialization,
                    WorkExperience = row.WorkExperience
                        .Select(w => new UserWorkExperienceForSimilarityRepositoryModel
                        {
                            Specialization = (SpecializationRepositoryEnum)w.Specialization,
                            StartedAt = w.StartedAt,
                            FinishedAt = w.FinishedAt
                        })
                        .ToList(),
                    Flags = row.Flags
                        .Select(f => new UserProfileFlagForSimilarityRepositoryModel
                        {
                            FlagId = f.FlagId,
                            Color = (UserProfileFlagColorRepositoryEnum)f.Color,
                            Weight = f.Weight
                        })
                        .ToList()
                };
            }
        }

        return result;
    }

    public async Task<IReadOnlyList<UserProfileFlagForSimilarityRepositoryModel>> GetUserFlagsForWeightAsync(
        Guid userId,
        CancellationToken ct)
    {
        if (userId == Guid.Empty)
            return [];

        return await dbContext.UserProfileFlags
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .Select(x => new UserProfileFlagForSimilarityRepositoryModel
            {
                FlagId = x.FlagId,
                Color = (UserProfileFlagColorRepositoryEnum)x.Color,
                Weight = x.Weight
            })
            .ToListAsync(ct);
    }

    private static IEnumerable<HashSet<Guid>> Batch(IReadOnlyCollection<Guid> source, int size)
    {
        var set = new HashSet<Guid>();
        foreach (var id in source)
        {
            set.Add(id);
            if (set.Count >= size)
            {
                yield return set;
                set = new HashSet<Guid>();
            }
        }

        if (set.Count > 0)
            yield return set;
    }
}
