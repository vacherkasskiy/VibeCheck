using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Models.Flags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Flags;
using ReviewService.PersistentStorage.Entities.Enums;

namespace ReviewService.PersistentStorage.Repositories.Flags;

public sealed class FlagsQueryRepository(AppDbContext dbContext) : IFlagsQueryRepository
{
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