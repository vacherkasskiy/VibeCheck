using AutoMapper;
using GamificatonService.Core.Abstractions.Models.GetUserAchievements;
using GamificatonService.Core.Abstractions.Models.Shared;
using GamificatonService.Core.Abstractions.Operations.Achievements;
using GamificatonService.PersistentStorage.Abstractions.Models.GetUserCompletedAchievements;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;

namespace GamificatonService.Core.Operations.Achievements;

public sealed class GetUserAchievementsOperation(
    IMapper mapper,
    IAchievementsQueryRepository queryRepository)
    : IGetUserAchievementsOperation
{
    public async Task<Result<GetUserAchievementsOperationResultModel>> GetAsync(
        GetUserAchievementsOperationModel model,
        CancellationToken ct)
    {
        var repoInput = mapper.Map<GetUserAchievementsRepositoryInputModel>(model);
        var repoOutput = await queryRepository.GetUserCompletedAchievementsAsync(repoInput, ct);

        // по спекам: 404 если userId не существует
        if (repoOutput is null)
            return Error.NotFound("user not found");

        return mapper.Map<GetUserAchievementsOperationResultModel>(repoOutput);
    }
}