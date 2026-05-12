using AutoMapper;
using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Gateway.Api.DTOs.Flags;

namespace ReviewService.Gateway.Api.MapperProfiles;

internal sealed class FlagsGatewayProfiles : Profile
{
    public FlagsGatewayProfiles()
    {
        CreateMap<GetAllFlagsOperationResultModel, GetAllFlagsResponse>();
        CreateMap<FlagOperationModel, GetAllFlagsItemDto>();
        CreateMap<GetUserFlagsOperationModel, GetMyUserFlagsResponse>();
        CreateMap<GetUserFlagsOperationModel, GetUserFlagsResponse>();
        CreateMap<GetUserFlagGroupOperationModel, UserFlagGroupResponse>();

        CreateMap<FlagCategoryOperationEnum, FlagCategoryDtoEnum>();
    }
}
