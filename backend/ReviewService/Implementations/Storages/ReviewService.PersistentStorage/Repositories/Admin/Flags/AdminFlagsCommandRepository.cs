using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Models.Admin.Flags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Admin.Flags;
using ReviewService.PersistentStorage.Entities;
using ReviewService.PersistentStorage.Entities.Enums;

namespace ReviewService.PersistentStorage.Repositories.Admin.Flags;

internal sealed class AdminFlagsCommandRepository(AppDbContext dbContext) : IAdminFlagsCommandRepository
{
    public async Task<AdminFlagRepositoryModel> CreateAsync(
        UpsertAdminFlagRepositoryModel model,
        DateTime utcNow,
        CancellationToken ct)
    {
        var flag = new FlagEntity
        {
            Id = Guid.NewGuid(),
            Name = model.Name.Trim(),
            Category = MapCategory(model.Category),
            Description = model.Description.Trim(),
            CreatedAt = utcNow
        };

        dbContext.Flags.Add(flag);
        await dbContext.SaveChangesAsync(ct);

        return Map(flag);
    }

    public async Task<AdminFlagRepositoryModel?> UpdateAsync(
        Guid flagId,
        UpsertAdminFlagRepositoryModel model,
        CancellationToken ct)
    {
        var flag = await dbContext.Flags
            .FirstOrDefaultAsync(x => x.Id == flagId, ct);

        if (flag is null)
            return null;

        flag.Name = model.Name.Trim();
        flag.Category = MapCategory(model.Category);
        flag.Description = model.Description.Trim();

        await dbContext.SaveChangesAsync(ct);

        return Map(flag);
    }

    public async Task DeleteAsync(Guid flagId, CancellationToken ct)
    {
        var flag = await dbContext.Flags
            .FirstAsync(x => x.Id == flagId, ct);

        dbContext.Flags.Remove(flag);
        await dbContext.SaveChangesAsync(ct);
    }

    private static AdminFlagRepositoryModel Map(FlagEntity flag) =>
        new()
        {
            FlagId = flag.Id,
            Name = flag.Name,
            Category = MapCategory(flag.Category),
            Description = flag.Description,
            CreatedAtUtc = flag.CreatedAt
        };

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
}
