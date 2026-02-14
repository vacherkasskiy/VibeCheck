using AutoMapper;
using GamificatonService.Core.Abstractions.Models.GetLevel;
using GamificatonService.Gateway.DTOs.GetLevel;

namespace GamificatonService.Gateway.MapperProfiles;

public class LevelsProfiles : Profile
{
    public LevelsProfiles()
    {
        CreateMap<GetLevelOperationResultModel, GetLevelGatewayResponse>();
        CreateMap<ProgressIntOperationModel, ProgressIntDto>();
    }
}