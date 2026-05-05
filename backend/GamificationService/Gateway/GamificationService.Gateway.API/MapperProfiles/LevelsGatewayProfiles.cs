using AutoMapper;
using GamificationService.Gateway.API.DTOs.GetLevel;
using GamificatonService.Core.Abstractions.Models.GetLevel;

namespace GamificationService.Gateway.API.MapperProfiles;

public class LevelsGatewayProfiles : Profile
{
    public LevelsGatewayProfiles()
    {
        CreateMap<GetLevelOperationResultModel, GetLevelGatewayResponse>();
        CreateMap<ProgressIntOperationModel, ProgressIntDto>();
    }
}