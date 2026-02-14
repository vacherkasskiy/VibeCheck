using AutoMapper;
using GamificatonService.Core.Abstractions.Enums;

namespace GamificatonService.Core.MapperProfiles;

internal sealed class SharedOperationsProfiles : Profile
{
    public SharedOperationsProfiles()
    {
        CreateMap<MyAchievementsFilterStatusOperationEnum, int>()
            .ConvertUsing(x => (int)x);

        CreateMap<int, AchievementStatusOperationEnum>()
            .ConvertUsing(x => (AchievementStatusOperationEnum)x);
    }
}