using AutoMapper;
using GamificatonService.CloudStorage.Abstractions.Services;
using GamificatonService.Core.Abstractions.Models.GetUserAchievements;
using GamificatonService.Core.Abstractions.Models.Shared;
using GamificatonService.Core.Abstractions.Operations.Achievements;
using GamificatonService.PersistentStorage.Abstractions.Models.GetUserCompletedAchievements;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;

namespace GamificatonService.Core.Operations.Achievements;

public sealed class GetUserAchievementsOperation(
    IMapper mapper,
    IAchievementsQueryRepository queryRepository,
    IAchievementsIconsStorage iconsStorage)
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

        var result = mapper.Map<GetUserAchievementsOperationResultModel>(repoOutput);

        var iconIdByAchievementId = repoOutput.Achievements
            .Where(x => x.IconId != Guid.Empty)
            .GroupBy(x => x.AchievementId)
            .ToDictionary(g => g.Key, g => g.First().IconId);

        if (iconIdByAchievementId.Count == 0)
            return result;

        var uniqueIconIds = iconIdByAchievementId.Values.Distinct().ToArray();
        var urlsByIconId = await iconsStorage.GetIconReadUrlsAsync(uniqueIconIds, ct);

        var patched = result.Achievements
            .Select(a =>
            {
                if (!iconIdByAchievementId.TryGetValue(a.AchievementId, out var iconId))
                    return a;

                return urlsByIconId.TryGetValue(iconId, out var url)
                    ? a with { IconUrl = url }
                    : a;
            })
            .ToList();

        return result with { Achievements = patched };
    }
}