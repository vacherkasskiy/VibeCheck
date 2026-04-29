using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles;

namespace ReviewService.PersistentStorage.Abstractions.Repositories.UserProfiles;

/// <summary>
/// query-репозиторий профилей пользователей.
/// нужен для обогащения выдачи отзывов: подтянуть iconId авторов батчом.
/// </summary>
public interface IUserProfilesQueryRepository
{
    /// <summary>
    /// возвращает словарь userId -> iconId (string?).
    /// ключи будут только для найденных пользователей.
    /// </summary>
    Task<IReadOnlyDictionary<Guid, string?>> GetIconIdsByUserIdsAsync(
        IReadOnlyCollection<Guid> userIds,
        CancellationToken ct);

    Task<string?> GetIconIdByUserIdAsync(
        Guid userId,
        CancellationToken ct);

    Task<IReadOnlyDictionary<Guid, UserProfileForSimilarityRepositoryModel>> GetProfilesForSimilarityByUserIdsAsync(
        IReadOnlyCollection<Guid> userIds,
        CancellationToken ct);

    Task<IReadOnlyList<UserProfileFlagForSimilarityRepositoryModel>> GetUserFlagsForWeightAsync(
        Guid userId,
        CancellationToken ct);
}
