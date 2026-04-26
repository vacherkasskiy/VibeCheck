using ReviewService.PersistentStorage.Abstractions.Models.Flags;

namespace ReviewService.PersistentStorage.Abstractions.Repositories.Flags;

public interface IUserFlagsCommandRepository
{
    Task ReplaceUserFlagsAsync(
        Guid userId,
        IReadOnlyCollection<ReplaceUserFlagRepositoryModel> flags,
        CancellationToken ct);
}