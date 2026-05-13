using ReviewService.PersistentStorage.Abstractions.Models.Admin.Flags;

namespace ReviewService.PersistentStorage.Abstractions.Repositories.Admin.Flags;

public interface IAdminFlagsQueryRepository
{
    Task<AdminFlagsPageRepositoryModel> GetFlagsAsync(
        GetAdminFlagsRepositoryInputModel input,
        CancellationToken ct);

    Task<AdminFlagRepositoryModel?> GetFlagAsync(Guid flagId, CancellationToken ct);

    Task<bool> FlagExistsByNameAsync(
        string name,
        Guid? exceptFlagId,
        CancellationToken ct);

    Task<bool> FlagIsUsedAsync(Guid flagId, CancellationToken ct);
}
