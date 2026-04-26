using Microsoft.EntityFrameworkCore;
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