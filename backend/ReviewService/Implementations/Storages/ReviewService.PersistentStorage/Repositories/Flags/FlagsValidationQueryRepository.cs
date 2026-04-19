using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Repositories.Flags;

namespace ReviewService.PersistentStorage.Repositories.Flags;

public sealed class FlagsValidationQueryRepository(AppDbContext dbContext) : IFlagsValidationQueryRepository
{
    public async Task<IReadOnlyCollection<Guid>> GetExistingFlagIdsAsync(
        IReadOnlyCollection<Guid> flagIds,
        CancellationToken ct)
    {
        return await dbContext.Flags
            .Where(x => flagIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToArrayAsync(ct);
    }
}