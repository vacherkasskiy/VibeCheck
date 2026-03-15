using AutoMapper;
using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Gateway.DTOs.Flags;

namespace ReviewService.Gateway.MapperProfiles;

internal sealed class FlagsGatewayProfiles : Profile
{
    public FlagsGatewayProfiles()
    {
        CreateMap<GetAllFlagsOperationResultModel, GetAllFlagsResponse>();
        CreateMap<FlagOperationModel, GetAllFlagsItemDto>();

        CreateMap<FlagCategoryOperationEnum, FlagCategoryDtoEnum>();
    }
}