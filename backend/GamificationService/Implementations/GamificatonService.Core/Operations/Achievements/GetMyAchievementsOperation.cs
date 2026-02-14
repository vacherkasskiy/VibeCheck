using AutoMapper;
using GamificatonService.Core.Abstractions.Models.GetMyAchievements;
using GamificatonService.Core.Abstractions.Models.Shared;
using GamificatonService.Core.Abstractions.Operations.Achievements;
using GamificatonService.PersistentStorage.Abstractions.Models.GetMyAchievements;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;

namespace GamificatonService.Core.Operations.Achievements;

public sealed class GetMyAchievementsOperation(
    IMapper mapper,
    IAchievementsQueryRepository queryRepository)
    : IGetMyAchievementsOperation
{
    public async Task<Result<GetMyAchievementsResultModel>> GetAsync(
        GetMyAchievementsOperationModel model,
        CancellationToken ct)
    {
        var repoInput = mapper.Map<GetMyAchievementsRepositoryInputModel>(model);
        var repoOutput = await queryRepository.GetMyAchievementsAsync(repoInput, ct);

        // для "me" 404 не заявлен, поэтому трактуем null как внутренняя ошибка
        if (repoOutput is null)
            return Error.Failure("failed to load achievements");

        return mapper.Map<GetMyAchievementsResultModel>(repoOutput);
    }
}