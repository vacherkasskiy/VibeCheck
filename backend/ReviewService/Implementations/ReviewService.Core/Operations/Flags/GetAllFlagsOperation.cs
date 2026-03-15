using AutoMapper;
using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Flags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Flags;

namespace ReviewService.Core.Operations.Flags;

internal sealed class GetAllFlagsOperation(
    IMapper mapper,
    IFlagsQueryRepository queryRepository)
    : IGetAllFlagsOperation
{
    public async Task<Result<GetAllFlagsOperationResultModel>> GetAsync(CancellationToken ct)
    {
        var repoOutput = await queryRepository.GetAllAsync(ct);

        if (repoOutput is null)
            return Error.Failure("failed to load flags");

        return mapper.Map<GetAllFlagsOperationResultModel>(repoOutput);
    }
}