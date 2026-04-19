using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Flags;

public interface ISetUserFlagsOperation
{
    Task<Result> ExecuteAsync(Guid userId, SetUserFlagsOperationModel model, CancellationToken ct);
}