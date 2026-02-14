using AutoMapper;
using GamificatonService.Core.Abstractions.Models.GetLevel;
using GamificatonService.Core.Abstractions.Models.Shared;
using GamificatonService.Core.Abstractions.Operations.Levels;
using GamificatonService.PersistentStorage.Abstractions.Models.Levels.GetMyLevel;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;

namespace GamificatonService.Core.Operations.Levels;

public sealed class GetMyLevelOperation(
    IMapper mapper,
    ILevelsQueryRepository queryRepository)
    : IGetMyLevelOperation
{
    public async Task<Result<GetLevelOperationResultModel>> GetAsync(CancellationToken ct)
    {
        var repoInput = mapper.Map<GetMyLevelRepositoryInputModel>(new GetMyLevelOperationModel());
        var repoOutput = await queryRepository.GetMyLevelAsync(repoInput, ct);

        if (repoOutput is null)
            return Error.Failure("failed to load current user level");

        return mapper.Map<GetLevelOperationResultModel>(repoOutput);
    }

    private sealed record GetMyLevelOperationModel;
}