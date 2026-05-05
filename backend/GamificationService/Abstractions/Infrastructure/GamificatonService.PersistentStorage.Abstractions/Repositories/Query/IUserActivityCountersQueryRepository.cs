using GamificatonService.PersistentStorage.Abstractions.Models.UserActivity;

namespace GamificatonService.PersistentStorage.Abstractions.Repositories.Query;

public interface IUserActivityCountersQueryRepository
{
    Task<long> GetCountByActionKeyAsync(
        GetUserActivityCountByActionKeyRepositoryInputModel input,
        CancellationToken ct);
}