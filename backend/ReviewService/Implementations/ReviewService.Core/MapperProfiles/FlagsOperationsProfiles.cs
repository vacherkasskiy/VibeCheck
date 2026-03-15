using AutoMapper;
using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.PersistentStorage.Abstractions.Models.Flags;

namespace ReviewService.Core.MapperProfiles;

internal sealed class FlagsOperationProfiles : Profile
{
    public FlagsOperationProfiles()
    {
        CreateMap<GetAllFlagsRepositoryOutputModel, GetAllFlagsOperationResultModel>();
        CreateMap<FlagRepositoryModel, FlagOperationModel>();

        CreateMap<FlagCategoryRepositoryEnum, FlagCategoryOperationEnum>();
    }
}