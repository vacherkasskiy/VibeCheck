namespace ReviewService.PersistentStorage.Abstractions.Repositories.Flags;

public interface IFlagsValidationQueryRepository
{
    Task<IReadOnlyCollection<Guid>> GetExistingFlagIdsAsync(IReadOnlyCollection<Guid> flagIds, CancellationToken ct);
}