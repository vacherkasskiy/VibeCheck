using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles;

namespace ReviewService.PersistentStorage.Abstractions.Repositories.UserProfiles;

public interface IUserProfilesCommandRepository
{
    Task<bool> UpsertProfileAsync(
        UpsertUserProfileRepositoryModel model,
        CancellationToken ct);
}
