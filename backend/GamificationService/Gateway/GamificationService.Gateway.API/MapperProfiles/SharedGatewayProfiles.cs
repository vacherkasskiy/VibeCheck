using AutoMapper;
using GamificationService.Gateway.API.DTOs.GetMyAchievements;
using GamificatonService.Core.Abstractions.Enums;

namespace GamificationService.Gateway.API.MapperProfiles;

internal sealed class SharedGatewayProfiles : Profile
{
    public SharedGatewayProfiles()
    {
        CreateMap<MyAchievementsFilterStatusGatewayEnum, MyAchievementsFilterStatusOperationEnum>();
    }
}