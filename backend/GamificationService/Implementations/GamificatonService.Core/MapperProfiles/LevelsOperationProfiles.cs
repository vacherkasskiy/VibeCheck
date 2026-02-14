using AutoMapper;
using GamificatonService.Core.Abstractions.Models.GetLevel;
using GamificatonService.PersistentStorage.Abstractions.Models.Levels;
using GamificatonService.PersistentStorage.Abstractions.Models.Levels.GetUserLevel;

namespace GamificatonService.Core.MapperProfiles;

internal sealed class LevelsOperationProfiles : Profile
{
    public LevelsOperationProfiles()
    {
        // operation input -> repository input
        // у тебя операция маппит Guid -> GetUserLevelRepositoryInputModel
        CreateMap<Guid, GetUserLevelRepositoryInputModel>()
            .ForMember(d => d.UserId, o => o.MapFrom(s => s));

        // repository output -> operation result
        CreateMap<GetLevelRepositoryOutputModel, GetLevelOperationResultModel>()
            .ForMember(d => d.Progress, o => o.MapFrom(s => new ProgressIntOperationModel
            {
                Current = s.ProgressCurrent,
                Target = s.ProgressTarget
            }));
    }
}