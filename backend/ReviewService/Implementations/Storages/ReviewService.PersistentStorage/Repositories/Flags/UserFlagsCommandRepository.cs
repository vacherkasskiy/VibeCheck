using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Models.Flags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Flags;
using ReviewService.PersistentStorage.Entities;
using ReviewService.PersistentStorage.Entities.Enums;

namespace ReviewService.PersistentStorage.Repositories.Flags;

internal sealed class UserFlagsCommandRepository(AppDbContext dbContext)
    : IUserFlagsCommandRepository
{
    public async Task ReplaceUserFlagsAsync(
        Guid userId,
        IReadOnlyCollection<ReplaceUserFlagRepositoryModel> flags,
        CancellationToken ct)
    {
        var existingFlags = await dbContext.UserProfileFlags
            .Where(x => x.UserId == userId)
            .ToListAsync(ct);

        if (existingFlags.Count > 0)
            dbContext.UserProfileFlags.RemoveRange(existingFlags);

        var newEntities = flags.Select(x => new UserProfileFlagEntity
        {
            UserId = userId,
            FlagId = x.FlagId,
            Color = (UserFlagColorEntityEnum)x.Color,
            Weight = x.Weight,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.UserProfileFlags.AddRangeAsync(newEntities, ct);
        await dbContext.SaveChangesAsync(ct);
    }
}