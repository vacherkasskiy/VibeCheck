using GamificatonService.PersistentStorage.Abstractions.Models.Levels;
using GamificatonService.PersistentStorage.Abstractions.Models.Levels.GetMyLevel;
using GamificatonService.PersistentStorage.Abstractions.Models.Levels.GetUserLevel;

namespace GamificatonService.PersistentStorage.Abstractions.Repositories.Query;

public interface ILevelsQueryRepository
{
    Task<GetLevelRepositoryOutputModel?> GetMyLevelAsync(
        GetMyLevelRepositoryInputModel input,
        CancellationToken ct);

    Task<GetLevelRepositoryOutputModel?> GetUserLevelAsync(
        GetUserLevelRepositoryInputModel input,
        CancellationToken ct);
}