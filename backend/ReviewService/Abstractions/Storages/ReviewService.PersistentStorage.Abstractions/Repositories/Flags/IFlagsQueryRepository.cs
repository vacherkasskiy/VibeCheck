using ReviewService.PersistentStorage.Abstractions.Models.Flags;

namespace ReviewService.PersistentStorage.Abstractions.Repositories.Flags;

public interface IFlagsQueryRepository
{
    Task<GetAllFlagsRepositoryOutputModel?> GetAllAsync(CancellationToken ct);

    Task<GetUserFlagsRepositoryModel?> GetUserFlagsAsync(Guid userId, CancellationToken ct);
}
