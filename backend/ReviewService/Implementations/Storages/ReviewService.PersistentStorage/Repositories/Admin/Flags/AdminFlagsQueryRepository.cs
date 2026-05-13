using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Models.Admin.Flags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Admin.Flags;
using ReviewService.PersistentStorage.Entities.Enums;

namespace ReviewService.PersistentStorage.Repositories.Admin.Flags;

internal sealed class AdminFlagsQueryRepository(AppDbContext dbContext) : IAdminFlagsQueryRepository
{
    public async Task<AdminFlagsPageRepositoryModel> GetFlagsAsync(
        GetAdminFlagsRepositoryInputModel input,
        CancellationToken ct)
    {
        var take = ClampInt(input.Take, 1, 200);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var query = dbContext.Flags.AsNoTracking();

        if (input.Category.HasValue)
        {
            var category = MapCategory(input.Category.Value);

            query = query.Where(x => x.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(input.Q))
        {
            var search = input.Q.Trim();

            query = query.Where(x =>
                EF.Functions.ILike(x.Name, $"%{search}%") ||
                EF.Functions.ILike(x.Description, $"%{search}%"));
        }

        var totalCount = await query.LongCountAsync(ct);

        var flags = await query
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Name)
            .Skip(skip)
            .Take(take)
            .Select(x => new AdminFlagRepositoryModel
            {
                FlagId = x.Id,
                Name = x.Name,
                Category = MapCategory(x.Category),
                Description = x.Description,
                CreatedAtUtc = x.CreatedAt
            })
            .ToListAsync(ct);

        return new AdminFlagsPageRepositoryModel
        {
            TotalCount = totalCount,
            Flags = flags
        };
    }

    public Task<AdminFlagRepositoryModel?> GetFlagAsync(Guid flagId, CancellationToken ct) =>
        dbContext.Flags
            .AsNoTracking()
            .Where(x => x.Id == flagId)
            .Select(x => new AdminFlagRepositoryModel
            {
                FlagId = x.Id,
                Name = x.Name,
                Category = MapCategory(x.Category),
                Description = x.Description,
                CreatedAtUtc = x.CreatedAt
            })
            .FirstOrDefaultAsync(ct);

    public Task<bool> FlagExistsByNameAsync(
        string name,
        Guid? exceptFlagId,
        CancellationToken ct)
    {
        var normalizedName = name.Trim();

        return dbContext.Flags
            .AsNoTracking()
            .AnyAsync(
                x => EF.Functions.ILike(x.Name, normalizedName) &&
                     (!exceptFlagId.HasValue || x.Id != exceptFlagId.Value),
                ct);
    }

    public async Task<bool> FlagIsUsedAsync(Guid flagId, CancellationToken ct)
    {
        return await dbContext.CompanyFlags.AsNoTracking().AnyAsync(x => x.FlagId == flagId, ct) ||
               await dbContext.ReviewFlags.AsNoTracking().AnyAsync(x => x.FlagId == flagId, ct) ||
               await dbContext.UserProfileFlags.AsNoTracking().AnyAsync(x => x.FlagId == flagId, ct);
    }

    private static FlagCategoryEntityEnum MapCategory(FlagCategoryRepositoryEnum category) => category switch
    {
        FlagCategoryRepositoryEnum.Culture => FlagCategoryEntityEnum.Culture,
        FlagCategoryRepositoryEnum.Management => FlagCategoryEntityEnum.Management,
        FlagCategoryRepositoryEnum.Processes => FlagCategoryEntityEnum.Processes,
        FlagCategoryRepositoryEnum.Communications => FlagCategoryEntityEnum.Communications,
        FlagCategoryRepositoryEnum.Image => FlagCategoryEntityEnum.Image,
        FlagCategoryRepositoryEnum.Compensation => FlagCategoryEntityEnum.Compensation,
        FlagCategoryRepositoryEnum.Career => FlagCategoryEntityEnum.Career,
        FlagCategoryRepositoryEnum.Balance => FlagCategoryEntityEnum.Balance,
        FlagCategoryRepositoryEnum.Conditions => FlagCategoryEntityEnum.Conditions,
        FlagCategoryRepositoryEnum.Values => FlagCategoryEntityEnum.Values,
        _ => throw new ArgumentOutOfRangeException(nameof(category), category, "unknown flag category")
    };

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

    private static int ClampInt(int value, int min, int max) =>
        value < min ? min : value > max ? max : value;
}
