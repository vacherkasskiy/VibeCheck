using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Flags;

public interface IGetMyUserFlagsOperation
{
    Task<Result<GetUserFlagsOperationModel>> GetAsync(Guid currentUserId, CancellationToken ct);
}
