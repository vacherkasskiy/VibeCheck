using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Flags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Flags;

namespace ReviewService.Core.Operations.Flags;

internal sealed class GetMyUserFlagsOperation(IFlagsQueryRepository flagsQueryRepository)
    : IGetMyUserFlagsOperation
{
    public async Task<Result<GetUserFlagsOperationModel>> GetAsync(Guid currentUserId, CancellationToken ct)
    {
        if (currentUserId == Guid.Empty)
            return Error.Validation("currentUserId is required");

        var repositoryModel = await flagsQueryRepository.GetUserFlagsAsync(currentUserId, ct);

        return repositoryModel is null
            ? new GetUserFlagsOperationModel
            {
                GreenFlags = [],
                RedFlags = []
            }
            : new GetUserFlagsOperationModel
            {
                GreenFlags = repositoryModel.GreenFlags
                    .Select(x => new GetUserFlagGroupOperationModel
                    {
                        Weight = x.Weight,
                        Flags = x.Flags
                    })
                    .ToArray(),
                RedFlags = repositoryModel.RedFlags
                    .Select(x => new GetUserFlagGroupOperationModel
                    {
                        Weight = x.Weight,
                        Flags = x.Flags
                    })
                    .ToArray()
            };
    }
}
