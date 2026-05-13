using ReviewService.PersistentStorage.Abstractions.Models.Admin.Flags;

namespace ReviewService.PersistentStorage.Abstractions.Repositories.Admin.Flags;

public interface IAdminFlagsCommandRepository
{
    Task<AdminFlagRepositoryModel> CreateAsync(
        UpsertAdminFlagRepositoryModel model,
        DateTime utcNow,
        CancellationToken ct);

    Task<AdminFlagRepositoryModel?> UpdateAsync(
        Guid flagId,
        UpsertAdminFlagRepositoryModel model,
        CancellationToken ct);

    Task DeleteAsync(Guid flagId, CancellationToken ct);
}
