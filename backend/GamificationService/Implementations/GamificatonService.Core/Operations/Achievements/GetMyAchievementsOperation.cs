using AutoMapper;
using GamificatonService.CloudStorage.Abstractions.Services;
using GamificatonService.Core.Abstractions.Models.GetMyAchievements;
using GamificatonService.Core.Abstractions.Models.Shared;
using GamificatonService.Core.Abstractions.Operations.Achievements;
using GamificatonService.PersistentStorage.Abstractions.Models.GetMyAchievements;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;

namespace GamificatonService.Core.Operations.Achievements;

public sealed class GetMyAchievementsOperation(
    IMapper mapper,
    IAchievementsQueryRepository queryRepository,
    IAchievementsIconsStorage iconsStorage)
    : IGetMyAchievementsOperation
{
    public async Task<Result<GetMyAchievementsOperationResultModel>> GetAsync(
        GetMyAchievementsOperationModel model,
        CancellationToken ct)
    {
        var repoInput = mapper.Map<GetMyAchievementsRepositoryInputModel>(model);
        var repoOutput = await queryRepository.GetMyAchievementsAsync(repoInput, ct);

        // для "me" 404 не заявлен, поэтому трактуем null как внутренняя ошибка
        if (repoOutput is null)
            return Error.Failure("failed to load achievements");

        var result = mapper.Map<GetMyAchievementsOperationResultModel>(repoOutput);

        // achievementId -> iconId (из репозитория)
        var iconIdByAchievementId = repoOutput.Achievements
            .Where(x => x.IconId != Guid.Empty)
            .GroupBy(x => x.AchievementId)
            .ToDictionary(g => g.Key, g => g.First().IconId);

        if (iconIdByAchievementId.Count == 0)
            return result;

        // iconId -> url (батч)
        var uniqueIconIds = iconIdByAchievementId.Values.Distinct().ToArray();
        var urlsByIconId = await iconsStorage.GetIconReadUrlsAsync(uniqueIconIds, ct);

        // проставляем IconUrl в operation-модели
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