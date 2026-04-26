using AutoMapper;
using GamificatonService.Core.Abstractions.Enums;
using GamificatonService.Core.Abstractions.Models.GetMyAchievements;
using GamificatonService.Core.Abstractions.Models.GetUserAchievements;
using GamificatonService.PersistentStorage.Abstractions.Models.GetMyAchievements;
using GamificatonService.PersistentStorage.Abstractions.Models.GetUserCompletedAchievements;

namespace GamificatonService.Core.MapperProfiles;

internal sealed class AchievementsOperationsProfiles : Profile
{
    public AchievementsOperationsProfiles()
    {
        CreateMap<GetMyAchievementsOperationModel, GetMyAchievementsRepositoryInputModel>()
            .ForMember(
                d => d.Status,
                o => o.MapFrom(s => (int)s.Status));

        CreateMap<GetUserAchievementsOperationModel, GetUserAchievementsRepositoryInputModel>();

        CreateMap<GetMyAchievementsRepositoryOutputModel, GetMyAchievementsOperationResultModel>();
        CreateMap<MyAchievementRepositoryItemOutputModel, MyAchievementItemModel>()
            .ForMember(d => d.Progress, o => o.MapFrom(s => new ProgressLongModel
            {
                Current = s.ProgressCurrent,
                Target = s.ProgressTarget
            }))
            .ForMember(
                d => d.Status,
                o => o.MapFrom(s => (AchievementStatusOperationEnum)s.Status));

        CreateMap<GetUserAchievementsRepositoryOutputModel, GetUserAchievementsOperationResultModel>();
        CreateMap<UserAchievementItemRepositoryOutputModel, UserAchievementItemOperationModel>();
    }
}