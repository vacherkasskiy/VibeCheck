using AutoMapper;
using GamificatonService.Core.Abstractions.Models.GetMyAchievements;
using GamificatonService.Core.Abstractions.Models.GetUserAchievements;
using GamificatonService.Gateway.DTOs.GetMyAchievements;
using GamificatonService.Gateway.DTOs.GetUserAchievements;

namespace GamificatonService.Gateway.MapperProfiles;

internal sealed class AchievementsGatewayProfiles : Profile
{
    public AchievementsGatewayProfiles()
    {
        CreateMap<GetUserAchievementsOperationResultModel, GetUserAchievementsGatewayResponse>();
        CreateMap<UserAchievementItemOperationModel, UserAchievementItemDto>();

        CreateMap<GetMyAchievementsOperationResultModel, GetMyAchievementsGatewayResponse>();
        CreateMap<MyAchievementItemModel, MyAchievementItemDto>();
        CreateMap<ProgressLongModel, ProgressDto>();
    }
}