using GamificatonService.PersistentStorage.Abstractions.Models.Levels;
using GamificatonService.PersistentStorage.Abstractions.Models.Levels.GetMyLevel;
using GamificatonService.PersistentStorage.Abstractions.Models.Levels.GetUserLevel;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;

namespace GamificatonService.PersistentStorage.Mocks;

/// <summary>
/// мок-репозиторий уровней: отдаёт хардкод.
/// </summary>
internal sealed class MockLevelsQueryRepository : ILevelsQueryRepository
{
    public Task<GetLevelRepositoryOutputModel?> GetMyLevelAsync(
        GetMyLevelRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        // "me" всегда существует
        GetLevelRepositoryOutputModel output = new()
        {
            CurrentLevel = 7,
            ProgressCurrent = 120,
            ProgressTarget = 200
        };

        return Task.FromResult<GetLevelRepositoryOutputModel?>(output);
    }

    public Task<GetLevelRepositoryOutputModel?> GetUserLevelAsync(
        GetUserLevelRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        // примитивная логика "юзер не найден"
        if (input.UserId == Guid.Empty)
            return Task.FromResult<GetLevelRepositoryOutputModel?>(null);

        GetLevelRepositoryOutputModel output = new()
        {
            CurrentLevel = 3,
            ProgressCurrent = 15,
            ProgressTarget = 60
        };

        return Task.FromResult<GetLevelRepositoryOutputModel?>(output);
    }
}