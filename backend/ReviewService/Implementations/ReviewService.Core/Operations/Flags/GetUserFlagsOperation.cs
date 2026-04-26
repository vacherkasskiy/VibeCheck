using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Flags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Flags;

namespace ReviewService.Core.Operations.Flags;

internal sealed class GetUserFlagsOperation(IFlagsQueryRepository flagsQueryRepository)
    : IGetUserFlagsOperation
{
    public async Task<Result<GetUserFlagsOperationModel>> GetAsync(Guid userId, CancellationToken ct)
    {
        if (userId == Guid.Empty)
            return Error.Validation("userId is required");

        var repositoryModel = await flagsQueryRepository.GetUserFlagsAsync(userId, ct);

        if (repositoryModel is null)
            return Error.NotFound("user not found");

        return new GetUserFlagsOperationModel
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
