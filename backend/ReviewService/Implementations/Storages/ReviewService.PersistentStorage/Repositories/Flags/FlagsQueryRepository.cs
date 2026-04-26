using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Models.Flags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Flags;
using ReviewService.PersistentStorage.Entities.Enums;

namespace ReviewService.PersistentStorage.Repositories.Flags;

public sealed class FlagsQueryRepository(AppDbContext dbContext) : IFlagsQueryRepository
{
    private sealed record UserFlagRow
    {
        public required UserFlagColorEntityEnum Color { get; init; }
        public required int Weight { get; init; }
        public required Guid FlagId { get; init; }
    }

    public async Task<GetAllFlagsRepositoryOutputModel?> GetAllAsync(CancellationToken ct)
    {
        var flags = await dbContext.Flags
            .AsNoTracking()
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Name)
            .Select(x => new FlagRepositoryModel
            {
                Id = x.Id,
                Name = x.Name,
                Category = MapCategory(x.Category),
                Description = x.Description
            })
            .ToListAsync(ct);

        return new GetAllFlagsRepositoryOutputModel { Flags = flags };
    }

    public async Task<GetUserFlagsRepositoryModel?> GetUserFlagsAsync(Guid userId, CancellationToken ct)
    {
        var userExists = await dbContext.UserProfiles
            .AsNoTracking()
            .AnyAsync(x => x.UserId == userId, ct);

        if (!userExists)
            return null;

        var userFlags = await dbContext.UserProfileFlags
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.Weight)
            .ThenBy(x => x.Flag.Name)
            .Select(x => new UserFlagRow
            {
                Color = x.Color,
                Weight = x.Weight,
                FlagId = x.FlagId
            })
            .ToListAsync(ct);

        return new GetUserFlagsRepositoryModel
        {
            GreenFlags = MapFlagGroups(userFlags, UserFlagColorEntityEnum.Green),
            RedFlags = MapFlagGroups(userFlags, UserFlagColorEntityEnum.Red)
        };
    }

    private static IReadOnlyCollection<GetUserFlagGroupRepositoryModel> MapFlagGroups(
        IReadOnlyCollection<UserFlagRow> userFlags,
        UserFlagColorEntityEnum color)
    {
        return userFlags
            .Where(x => x.Color == color)
            .GroupBy(x => x.Weight)
            .OrderBy(x => x.Key)
            .Select(x => new GetUserFlagGroupRepositoryModel
            {
                Weight = x.Key,
                Flags = x.Select(y => y.FlagId).ToArray()
            })
            .ToArray();
    }

    private static FlagCategoryRepositoryEnum MapCategory(FlagCategoryEntityEnum category) => category switch
    {
        FlagCategoryEntityEnum.Culture => FlagCategoryRepositoryEnum.Culture,
        FlagCategoryEntityEnum.Management => FlagCategoryRepositoryEnum.Management,
        FlagCategoryEntityEnum.Processes => FlagCategoryRepositoryEnum.Processes,
        FlagCategoryEntityEnum.Communications => FlagCategoryRepositoryEnum.Communications,
        FlagCategoryEntityEnum.Image => FlagCategoryRepositoryEnum.Image,
        FlagCategoryEntityEnum.Compensation => FlagCategoryRepositoryEnum.Compensation,
        FlagCategoryEntityEnum.Career => FlagCategoryRepositoryEnum.Career,
        FlagCategoryEntityEnum.Balance => FlagCategoryRepositoryEnum.Balance,
        FlagCategoryEntityEnum.Conditions => FlagCategoryRepositoryEnum.Conditions,
        FlagCategoryEntityEnum.Values => FlagCategoryRepositoryEnum.Values,
        _ => throw new ArgumentOutOfRangeException(nameof(category), category, "unknown flag category")
    };
}
