using AutoMapper;
using GamificatonService.Core.Abstractions.Enums;
using GamificatonService.Gateway.DTOs.GetMyAchievements;

namespace GamificatonService.Gateway.MapperProfiles;

internal sealed class SharedProfiles : Profile
{
    public SharedProfiles()
    {
        CreateMap<MyAchievementsFilterStatusGatewayEnum, MyAchievementsFilterStatusOperationEnum>();
    }
}