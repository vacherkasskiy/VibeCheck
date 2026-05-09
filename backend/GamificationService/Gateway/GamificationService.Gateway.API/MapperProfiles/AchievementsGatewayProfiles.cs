using AutoMapper;
using GamificationService.Gateway.API.DTOs.GetMyAchievements;
using GamificationService.Gateway.API.DTOs.GetUserAchievements;
using GamificatonService.Core.Abstractions.Models.GetMyAchievements;
using GamificatonService.Core.Abstractions.Models.GetUserAchievements;

namespace GamificationService.Gateway.API.MapperProfiles;

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