using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Models.Users;

namespace ReviewService.Core.Abstractions.Operations.Users;

public interface IApplyUserProfileUpdatedOperation
{
    Task<Result> ApplyAsync(
        ApplyUserProfileUpdatedOperationModel model,
        CancellationToken ct);
}
