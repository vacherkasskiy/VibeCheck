using AutoMapper;
using GamificatonService.Core.Abstractions.Models.GetLevel;
using GamificatonService.Gateway.DTOs.GetLevel;

namespace GamificatonService.Gateway.MapperProfiles;

public class LevelsGatewayProfiles : Profile
{
    public LevelsGatewayProfiles()
    {
        CreateMap<GetLevelOperationResultModel, GetLevelGatewayResponse>();
        CreateMap<ProgressIntOperationModel, ProgressIntDto>();
    }
}