using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Flags;

public interface IGetUserFlagsOperation
{
    Task<Result<GetUserFlagsOperationModel>> GetAsync(Guid userId, CancellationToken ct);
}
